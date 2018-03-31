import React, { PureComponent } from 'react';
import {
  Styled,
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

const styles = s.styles({
  icon: {
    margin: '0 1rem',
  },
  colorSquare: color => ({
    display: 'inline-block',
    width: '1rem',
    height: '1rem',
    backgroundColor: color,
    border: 'var(--border)',
    boxShadow: 'var(--boxShadow)',
  }),
  spacingSquare: size => ({
    display: 'inline-block',
    width: size,
    height: size,
    backgroundColor: '#93FAC9',
    boxShadow: 'var(--boxShadow)',
  }),
  spacingLabel: {
    width: '100px',
    display: 'inline-block',
  },
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

        <Styled as="h1" $textAlign="center">THEME</Styled>

        <Styled $marginBottom="var(--spacing-medium)">
          <h3>Colors</h3>
          <div className={styles.colorSquare('var(--color-text)')} /> Text color <br />
          <div className={styles.colorSquare('var(--color-heading)')} /> Heading color <br />

          <div className={styles.colorSquare('var(--color-primary)')} /> Primary color <br />
          <div className={styles.colorSquare('var(--color-secondary)')} /> Secondary color <br />
          <div className={styles.colorSquare('var(--color-link)')} /> Link color <br />
          <div className={styles.colorSquare('var(--color-light)')} /> Light color <br />

          <div className={styles.colorSquare('var(--bg-color)')} /> Background color <br />
          <div className={styles.colorSquare('var(--bg-color-darker)')} /> Background color (darker) <br />
        </Styled>

        <Styled $marginBottom="var(--spacing-medium)">
          <h3>Font size</h3>
          <Styled $fontSize="var(--font-size-xlarge)">Xlarge</Styled>
          <Styled $fontSize="var(--font-size-large)">Large</Styled>
          <Styled $fontSize="var(--font-size-medium)">Medium</Styled>
          <Styled $fontSize="var(--font-size-small)">Small</Styled>
          <Styled $fontSize="var(--font-size-fine)">Fine</Styled>
        </Styled>

        <Styled $marginBottom="var(--spacing-medium)">
          <h3>Spacing</h3>
          <div>
            <span className={styles.spacingLabel}>Fine</span>
            <div className={styles.spacingSquare('var(--spacing-fine)')} />
          </div>
          <div>
            <span className={styles.spacingLabel}>Small</span>
            <div className={styles.spacingSquare('var(--spacing-small)')} />
          </div>
          <div>
            <span className={styles.spacingLabel}>Medium</span>
            <div className={styles.spacingSquare('var(--spacing-medium)')} />
          </div>
          <div>
            <span className={styles.spacingLabel}>Large</span>
            <div className={styles.spacingSquare('var(--spacing-large)')} />
          </div>
        </Styled>

        <Styled $marginBottom="var(--spacing-medium)">
          <h3>Icons</h3>
          {ICON_TYPES.map(type => <Styled as={Icon} key={type} type={type} $margin="0 1rem" />)}
        </Styled>

        <h3>Buttons</h3>
        <div className={s.cx(s.flex({ column: true }))}>
          <Styled $marginBottom="var(--spacing-medium)">
            <Button primary>Primary Button</Button>
            <div className={s.cx({ display: 'inline-block', width: '30px' })} />
            <Button primary disabled>Primary Button</Button>
          </Styled>

          <Styled $marginBottom="var(--spacing-medium)">
            <Button>Button</Button>
            <div className={s.cx({ display: 'inline-block', width: '30px' })} />
            <Button disabled>Button</Button>
          </Styled>

          <Styled $marginBottom="var(--spacing-medium)">
            <Link to={{ name: 'theme' }}>Link to theme</Link>
          </Styled>
        </div>

        <h3>Forms</h3>

        <Styled $marginBottom="var(--spacing-medium)">
          <Select name="select" options={{ val1: 'val1', val2: 'val2' }} onChange={noop} />
        </Styled>

        <Styled $marginBottom="var(--spacing-medium)">
          <Input name="input1" value="Input example (light)" light onChange={noop} />
        </Styled>

        <Styled $marginBottom="var(--spacing-medium)">
          <Input name="input11" value="Input example (light) with clear" light onChange={noop} onClear={noop} />
        </Styled>

        <Styled $marginBottom="var(--spacing-medium)">
          <Input name="input2" value="Input example" onChange={noop} />
        </Styled>

        <Styled $marginBottom="var(--spacing-medium)">
          <Input name="input21" value="Input example with clear" onChange={noop} onClear={noop} />
        </Styled>

        <Styled $marginBottom="var(--spacing-medium)">
          <Textarea name="textarea" value="Textarea example" onChange={noop} />
        </Styled>

        <Styled $marginBottom="var(--spacing-medium)">
          <Button raised onClick={this.showModal}>Show modal</Button>

          {this.state.showModal && (
            <ConfirmationDialog confirmation="Remove" onConfirmed={this.hideModal} onCancel={this.hideModal}>
              Are you sure you want to <b>remove it?</b>
            </ConfirmationDialog>
          )
          }
        </Styled>
      </div>
    );
  }
}
