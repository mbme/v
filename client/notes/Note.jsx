import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { getFileUrl } from 'shared/api-client'
import { parse } from 'shared/parser'
import s from 'client/styles'

export const Title = s.cx({
  textAlign: 'center',
  letterSpacing: '1.4px',
}, 'heading')

const Document = s.cx({
  hyphens: 'auto',
  textAlign: 'justify',
})

const Image = s.cx({
  padding: 'var(--spacing-medium) 0',
}, 'section')

function renderItem(item) {
  switch (item.type) {
    case 'Document': {
      const children = item.items.map(renderItem)
      return React.createElement('article', { className: Document }, ...children)
    }

    case 'Paragraph': {
      const children = item.items.map(renderItem)
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
      const url = item.link.isInternal ? getFileUrl(item.link.address) : item.link.address

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

  render() {
    return (
      <div>
        <h1 className={Title}>{this.props.name}</h1>
        {renderItem(parse(this.props.data))}
      </div>
    )
  }
}
