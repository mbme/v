import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { parse } from 'shared/parser'
import s from 'client/styles'

export const Title = s.cx({
  textAlign: 'center',
  letterSpacing: '1.4px',
}, s.Heading)

const Document = s.cx({
  padding: 'var(--spacing-medium)',
  hyphens: 'auto',
  textAlign: 'justify',
})

const Image = s.cx({
  padding: 'var(--spacing-medium) 0',
}, 'section')

function renderItem(item, apiClient) {
  switch (item.type) {
    case 'Document': {
      const children = item.items.map(childItem => renderItem(childItem, apiClient))
      return React.createElement('article', { className: Document }, ...children)
    }

    case 'Paragraph': {
      const children = item.items.map(childItem => renderItem(childItem, apiClient))
      return React.createElement('p', {}, ...children)
    }

    case 'Header':
      return (
        <h1>{item.text}</h1>
      )

    case 'Mono':
      return (
        <code>{item.text}</code>
      )

    case 'Bold':
      return (
        <strong>{item.text}</strong>
      )

    case 'Link': {
      const url = item.link.isInternal ? apiClient.getFileUrl(item.link.address) : item.link.address

      if (item.link.type === 'image') {
        return (
          <img className={Image} alt={item.link.name} src={url} />
        )
      }

      return (
        <a href={url}>{item.link.name}</a>
      )
    }

    default:
      return item
  }
}

export default class Note extends PureComponent {
  static propTypes = {
    name: PropTypes.string.isRequired,
    data: PropTypes.string.isRequired,
  }

  static contextTypes = {
    apiClient: PropTypes.object.isRequired,
  }

  render() {
    return (
      <div className={s.Paper}>
        <h1 className={Title}>{this.props.name}</h1>
        {renderItem(parse(this.props.data), this.context.apiClient)}
      </div>
    )
  }
}
