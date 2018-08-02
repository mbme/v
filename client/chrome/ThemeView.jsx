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
} from '../components';
import { ICON_TYPES } from '../components/Icon';

const colorSquare = color => <div className="Theme-color-square" style={{ backgroundColor: color }} />;
const spacingSquare = size => <div className="Theme-spacing-square" style={{ width: size, height: size }} />;

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

        <h1 className="g-centered">THEME</h1>

        <div className="g-section">
          <h3>Colors</h3>
          {colorSquare('var(--color-text)')} Text color <br />
          {colorSquare('var(--color-heading)')} Heading color <br />

          {colorSquare('var(--color-primary)')} Primary color <br />
          {colorSquare('var(--color-secondary)')} Secondary color <br />
          {colorSquare('var(--color-link)')} Link color <br />
          {colorSquare('var(--color-light)')} Light color <br />

          {colorSquare('var(--bg-color)')} Background color <br />
          {colorSquare('var(--bg-color-darker)')} Background color (darker) <br />
        </div>

        <div className="g-section">
          <h3>Font size</h3>
          <div style={{ fontSize: 'var(--font-size-xlarge)' }}>Xlarge</div>
          <div style={{ fontSize: 'var(--font-size-large)' }}>Large</div>
          <div style={{ fontSize: 'var(--font-size-medium)' }}>Medium</div>
          <div style={{ fontSize: 'var(--font-size-small)' }}>Small</div>
          <div style={{ fontSize: 'var(--font-size-fine)' }}>Fine</div>
        </div>

        <div className="g-section">
          <h3>Spacing</h3>
          <div>
            <span className="Theme-spacing-label">Fine</span>
            {spacingSquare('var(--spacing-fine)')}
          </div>
          <div>
            <span className="Theme-spacing-label">Small</span>
            {spacingSquare('var(--spacing-small)')}
          </div>
          <div>
            <span className="Theme-spacing-label">Medium</span>
            {spacingSquare('var(--spacing-medium)')}
          </div>
          <div>
            <span className="Theme-spacing-label">Large</span>
            {spacingSquare('var(--spacing-large)')}
          </div>
        </div>

        <div className="g-section">
          <h3>Icons</h3>
          {ICON_TYPES.map(type => <Icon key={type} type={type} className="Theme-icon" />)}
        </div>

        <h3>Buttons</h3>
        <div className="Theme-buttons">
          <div className="g-section">
            <Button primary>Primary Button</Button>
            <div className="Theme-buttons-spacer" />
            <Button primary disabled>Primary Button</Button>
          </div>

          <div className="g-section">
            <Button>Button</Button>
            <div className="Theme-buttons-spacer" />
            <Button disabled>Button</Button>
          </div>

          <div className="g-section">
            <Link to={{ name: 'theme' }}>Link to theme</Link>
          </div>
        </div>

        <h3>Forms</h3>

        <div className="g-section">
          <Select name="select" options={{ val1: 'val1', val2: 'val2' }} onChange={noop} />
        </div>

        <div className="g-section">
          <Input name="input1" value="Input example (light)" light onChange={noop} />
        </div>

        <div className="g-section">
          <Input name="input11" value="Input example (light) with clear" light onChange={noop} onClear={noop} />
        </div>

        <div className="g-section">
          <Input name="input2" value="Input example" onChange={noop} />
        </div>

        <div className="g-section">
          <Input name="input21" value="Input example with clear" onChange={noop} onClear={noop} />
        </div>

        <div className="g-section">
          <Textarea name="textarea" value="Textarea example" onChange={noop} />
        </div>

        <div className="g-section">
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
