import PropTypes from 'prop-types';

export const noteShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  updatedTs: PropTypes.number.isRequired,
  fields: PropTypes.shape({
    name: PropTypes.string.isRequired,
    data: PropTypes.string,
  }).isRequired,
});
