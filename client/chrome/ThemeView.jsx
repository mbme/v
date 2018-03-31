import React, { PureComponent } from 'react';
import {
  Link,
  Textarea,
  Input,
  ConfirmationDialog,
  Select,
  Button,
  Icon,
  Toolbar,
} from 'client/components';
import { ICON_TYPES } from 'client/components/Icon';
import s from 'client/styles';

const sectionStyles = s.cx(s.section);
const headingStyles = s.cx({ textAlign: 'center' });
const iconStyles = s.cx({ margin: '0 1rem' });

const colorSquareStyles = color => s.cx({
  display: 'inline-block',
  width: '1rem',
  height: '1rem',
  backgroundColor: color,
  border: 'var(--border)',
  boxShadow: 'var(--boxShadow)',
});

const spacingSquareStyles = size => s.cx({
  display: 'inline-block',
  width: size,
  height: size,
  backgroundColor: '#93FAC9',
  boxShadow: 'var(--boxShadow)',
});

const spacingLabel = s.cx({
  width: '100px',
  display: 'inline-block',
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
        <Toolbar />

        <h1 className={headingStyles}>THEME</h1>

        <div className={sectionStyles}>
          <h3>Colors</h3>
          <div className={colorSquareStyles('var(--color-text)')} /> Text color <br />
          <div className={colorSquareStyles('var(--color-heading)')} /> Heading color <br />

          <div className={colorSquareStyles('var(--color-primary)')} /> Primary color <br />
          <div className={colorSquareStyles('var(--color-secondary)')} /> Secondary color <br />
          <div className={colorSquareStyles('var(--color-link)')} /> Link color <br />
          <div className={colorSquareStyles('var(--color-light)')} /> Light color <br />

          <div className={colorSquareStyles('var(--bg-color)')} /> Background color <br />
          <div className={colorSquareStyles('var(--bg-color-darker)')} /> Background color (darker) <br />
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
          <h3>Spacing</h3>
          <div>
            <span className={spacingLabel}>Fine</span>
            <div className={spacingSquareStyles('var(--spacing-fine)')} />
          </div>
          <div>
            <span className={spacingLabel}>Small</span>
            <div className={spacingSquareStyles('var(--spacing-small)')} />
          </div>
          <div>
            <span className={spacingLabel}>Medium</span>
            <div className={spacingSquareStyles('var(--spacing-medium)')} />
          </div>
          <div>
            <span className={spacingLabel}>Large</span>
            <div className={spacingSquareStyles('var(--spacing-large)')} />
          </div>
        </div>

        <div className={sectionStyles}>
          <h3>Icons</h3>
          {ICON_TYPES.map(type => <Icon key={type} type={type} className={iconStyles} />)}
        </div>

        <h3>Buttons</h3>
        <div className={s.cx(s.flex({ column: true }))}>
          <div className={sectionStyles}>
            <Button primary>Primary Button</Button>
            <div className={s.cx({ display: 'inline-block', width: '30px' })} />
            <Button primary disabled>Primary Button</Button>
          </div>
          <div className={sectionStyles}>
            <Button>Button</Button>
            <div className={s.cx({ display: 'inline-block', width: '30px' })} />
            <Button disabled>Button</Button>
          </div>
          <div className={sectionStyles}>
            <Link to={{ name: 'theme' }}>Link to theme</Link>
          </div>
        </div>

        <h3>Forms</h3>

        <div className={sectionStyles}>
          <Select name="select" options={{ val1: 'val1', val2: 'val2' }} onChange={noop} />
        </div>

        <div className={sectionStyles}>
          <Input name="input1" value="Input example (light)" light onChange={noop} />
        </div>
        <div className={sectionStyles}>
          <Input name="input11" value="Input example (light) with clear" light onChange={noop} onClear={noop} />
        </div>
        <div className={sectionStyles}>
          <Input name="input2" value="Input example" onChange={noop} />
        </div>
        <div className={sectionStyles}>
          <Input name="input21" value="Input example with clear" onChange={noop} onClear={noop} />
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
