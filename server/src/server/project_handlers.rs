use std::sync::Arc;

use error::Error;
use storage::Storage;

use super::dto::*;
use super::utils::*;

use iron::prelude::*;
use iron::status;
use iron::Handler;

use serde_json;

pub struct ListProjectsHandler(pub Arc<Storage>);
impl Handler for ListProjectsHandler {
    fn handle(&self, _: &mut Request) -> IronResult<Response> {
        let records = itry!(
            self.0.list_project_records(),
            status::InternalServerError
        );

        let dtos: Vec<RecordDTO> = convert_all_into(records);

        create_response(&dtos)
    }
}

pub struct AddProjectHandler(pub Arc<Storage>);
impl Handler for AddProjectHandler {
    fn handle(&self, req: &mut Request) -> IronResult<Response> {
        // parse request body
        let body = itry!(
            get_request_body(req), status::BadRequest
        );
        let dto: CreateProjectDTO = itry!(
            serde_json::from_str(&body), status::BadRequest
        );

        let id = itry!(
            self.0.add_project(&dto.name, &dto.description),
            status::InternalServerError
        );

        // FIXME extract this pattern (project MUST exist at this point)
        let project_opt = itry!(self.0.get_project(id));
        let project = itry!(
            project_opt.ok_or(Error::from_str("Can't find project")),
            status::NotFound
        );

        let dto: ProjectDTO = project.into();

        create_response(&dto)
    }
}

pub struct UpdateProjectHandler(pub Arc<Storage>);
impl Handler for UpdateProjectHandler {
    fn handle(&self, req: &mut Request) -> IronResult<Response> {
        let id = itry!(get_id(req), status::BadRequest);

        // parse request body
        let body = itry!(
            get_request_body(req), status::BadRequest
        );
        let dto: UpdateProjectDTO = itry!(
            serde_json::from_str(&body), status::BadRequest
        );

        // update project
        let updated = itry!(
            self.0.update_project(id, &dto.name, &dto.description),
            status::InternalServerError
        );

        if !updated {
            return Err(IronError::new(Error::from_str("Can't find project"), status::NotFound));
        }

        // return updated project
        let project = itry!(
            self.0.get_project(id)
                .and_then(|note| note.ok_or(Error::from_str("Can't find project"))),
            status::InternalServerError
        );

        let dto: ProjectDTO = project.into();

        create_response(&dto)
    }
}

pub struct GetProjectHandler(pub Arc<Storage>);
impl Handler for GetProjectHandler {
    fn handle(&self, req: &mut Request) -> IronResult<Response> {
        let id = itry!(get_id(req), status::BadRequest);

        let project_opt = itry!(self.0.get_project(id));
        let project = itry!(
            project_opt.ok_or(Error::from_str("Can't find project")),
            status::NotFound
        );

        let dto: ProjectDTO = project.into();

        create_response(&dto)
    }
}
