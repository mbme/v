import React, { PureComponent } from 'react';
import {
  Link,
  Textarea,
  Input,
  ConfirmationDialog,
  Select,
  Button,
  IconButton,
  Icon,
} from 'client/components';
import { ICON_TYPES } from 'client/components/Icon';
import s from 'client/styles';

const sectionStyles = s.cx(s.section);
const headingStyles = s.cx({ textAlign: 'center' });
const iconStyles = s.cx({ margin: '0 1rem' });

const squareStyles = color => s.cx({
  display: 'inline-block',
  width: '1rem',
  height: '1rem',
  backgroundColor: color,
  border: 'var(--border)',
  boxShadow: 'var(--boxShadow)',
});

export default class ThemeView extends PureComponent {
  state = {
    showModal: false,
  };

  showModal = () => this.setState({ showModal: true });
  hideModal = () => this.setState({ showModal: false });

  render() {
    return (
      <div>
        <h1 className={headingStyles}>THEME</h1>

        <div className={sectionStyles}>
          <h3>Colors</h3>
          <div className={squareStyles('var(--color)')} /> Text color <br />
          <div className={squareStyles('var(--color-primary)')} /> Primary color <br />
          <div className={squareStyles('var(--color-secondary)')} /> Secondary color <br />
          <div className={squareStyles('var(--color-link)')} /> Link color <br />
          <div className={squareStyles('var(--bg-color)')} /> Background color <br />
        </div>

        <div className={sectionStyles}>
          <h3>Font size</h3>
          <div className={s.cx({ fontSize: 'var(--font-size-xlarge)' })}>Xlarge</div>
          <div className={s.cx({ fontSize: 'var(--font-size-large)' })}>Large</div>
          <div className={s.cx({ fontSize: 'var(--font-size-medium)' })}>Medium</div>
          <div className={s.cx({ fontSize: 'var(--font-size-small)' })}>Small</div>
          <div className={s.cx({ fontSize: 'var(--font-size-fine)' })}>Fine</div>
        </div>

        <div className={sectionStyles}>
          <h3>Icons</h3>
          {ICON_TYPES.map(type => <Icon key={type} type={type} className={iconStyles} />)}
        </div>

        <div className={sectionStyles}>
          <Button>Button</Button>
          <Button disabled>Disabled Button</Button>
        </div>

        <div className={sectionStyles}>
          <Button raised>Raised Button</Button>
          <Button raised disabled>Raised Disabled Button</Button>
        </div>

        <div className={sectionStyles}>
          Icon Button <IconButton type="eye" />
        </div>

        <div className={sectionStyles}>
          <Link to={{ name: 'theme' }}>Link to theme</Link>
        </div>

        <div className={sectionStyles}>
          <Select name="select" options={{ val1: 'val1', val2: 'val2' }} onChange={noop} />
        </div>

        <div className={sectionStyles}>
          <Input name="input1" value="Input example (light)" light onChange={noop} />
        </div>
        <div className={sectionStyles}>
          <Input name="input2" value="Input example" onChange={noop} />
        </div>

        <div className={sectionStyles}>
          <Textarea name="textarea" value="Textarea example" onChange={noop} />
        </div>

        <div className={sectionStyles}>
          <Button raised onClick={this.showModal}>Show modal</Button>

          {this.state.showModal && (
            <ConfirmationDialog confirmation="Remove" onConfirmed={this.hideModal} onCancel={this.hideModal}>
              Are you sure you want to <b>remove it?</b>
            </ConfirmationDialog>
          )
          }
        </div>
      </div>
    );
  }
}
