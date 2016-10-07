use std::sync::Arc;

use utils::convert_all_into;
use error::Error;
use storage::Storage;
use storage::types::{Project, TodoState};

use super::dto::*;
use super::utils::*;

use iron::prelude::*;
use iron::status;
use iron::Handler;

use time::Timespec;
use serde_json;

fn extract_project (req: &mut Request, storage: Arc<Storage>) -> IronResult<Project> {
    let project_id_str = itry!(
        get_url_param(req, "project_id"), status::BadRequest
    );

    let project_id = itry!(
        parse_id(&project_id_str), status::BadRequest
    );

    let project_opt = itry!(storage.get_project(project_id));
    let project = itry!(
        project_opt.ok_or(Error::from_str("Can't find project")),
        status::NotFound
    );

    Ok(project)
}


pub struct ListProjectTodosHandler(pub Arc<Storage>);
impl Handler for ListProjectTodosHandler {
    fn handle(&self, req: &mut Request) -> IronResult<Response> {
        let project = try!(extract_project(req, self.0.clone()));

        let todos = itry!(self.0.list_todos(&project));

        let dtos: Vec<TodoDTO> = convert_all_into(todos);

        create_response(&dtos)
    }
}

pub struct AddProjectTodoHandler(pub Arc<Storage>);
impl Handler for AddProjectTodoHandler {
    fn handle(&self, req: &mut Request) -> IronResult<Response> {
        let project = try!(extract_project(req, self.0.clone()));

        // parse request body
        let body = itry!(
            get_request_body(req), status::BadRequest
        );
        let dto: CreateTodoDTO = itry!(
            serde_json::from_str(&body), status::BadRequest
        );

        let id = itry!(
            self.0.add_todo(
                &project,
                &dto.name,
                &dto.details,
                dto.start_ts.map(|ts| Timespec::new(ts, 0)),
                dto.start_ts.map(|ts| Timespec::new(ts, 0)),
            ),
            status::InternalServerError
        );

        let todo_opt = itry!(self.0.get_todo(id));
        let todo = itry!(
            todo_opt.ok_or(Error::from_str("Can't find todo")),
            status::NotFound
        );

        let dto: TodoDTO = todo.into();

        create_response(&dto)
    }
}

pub struct UpdateProjectTodoHandler(pub Arc<Storage>);
impl Handler for UpdateProjectTodoHandler {
    fn handle(&self, req: &mut Request) -> IronResult<Response> {
        let id = itry!(get_id(req), status::BadRequest);

        // parse request body
        let body = itry!(
            get_request_body(req), status::BadRequest
        );
        let dto: UpdateTodoDTO = itry!(
            serde_json::from_str(&body), status::BadRequest
        );

        let state: TodoState = itry!(dto.state.parse(), status::BadRequest);

        // update todo
        let updated = itry!(
            self.0.update_todo(
                id,
                &dto.name,
                &dto.details,
                state,
                dto.start_ts.map(|ts| Timespec::new(ts, 0)),
                dto.end_ts.map(|ts| Timespec::new(ts, 0))
            ),
            status::InternalServerError
        );

        if !updated {
            return Err(IronError::new(Error::from_str("Can't find todo"), status::NotFound));
        }

        // FIXME use this pattern everywhere
        // return updated todo
        let todo = itry!(
            self.0.get_todo(id)
                .and_then(|todo| todo.ok_or(Error::from_str("Can't find todo"))),
            status::InternalServerError
        );

        let dto: TodoDTO = todo.into();

        create_response(&dto)
    }
}

pub struct GetProjectTodoHandler(pub Arc<Storage>);
impl Handler for GetProjectTodoHandler {
    fn handle(&self, req: &mut Request) -> IronResult<Response> {
        let id = itry!(get_id(req), status::BadRequest);

        let todo_opt = itry!(self.0.get_todo(id));
        let todo = itry!(
            todo_opt.ok_or(Error::from_str("Can't find todo")),
            status::NotFound
        );

        let dto: TodoDTO = todo.into();

        create_response(&dto)
    }
}
