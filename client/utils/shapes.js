import PropTypes from 'prop-types';

export const noteShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  updatedTs: PropTypes.number.isRequired,
  fields: PropTypes.shape({
    name: PropTypes.string.isRequired,
    data: PropTypes.string,
  }).isRequired,
});

export const trackShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  fields: PropTypes.shape({
    artist: PropTypes.string.isRequired,
    title: PropTypes.string,
  }).isRequired,
});
