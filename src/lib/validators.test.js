// Tests for client-side validators. OWNER: PM.
import test from 'node:test';
import assert from 'node:assert/strict';
import { emailError, hasErrors, nameError, passwordError, requiredError, validateForm } from './validators.js';

test('emailError', () => {
  assert.equal(emailError('ayse@voltflow.demo'), '');
  assert.ok(emailError('ayse@'));
  assert.ok(emailError('  '));
});

test('passwordError', () => {
  assert.ok(passwordError(''));
  assert.ok(passwordError('short1'));
  assert.ok(passwordError('onlyletters'));
  assert.equal(passwordError('Customer123!'), '');
});

test('nameError and requiredError', () => {
  assert.ok(nameError('A'));
  assert.equal(nameError('Ayşe'), '');
  assert.equal(requiredError('x', 'City'), '');
  assert.equal(requiredError('', 'City'), 'City is required.');
});

test('validateForm collects one message per invalid field', () => {
  const errors = validateForm({ email: 'bad', password: 'Customer123!' }, { email: emailError, password: passwordError });
  assert.deepEqual(Object.keys(errors), ['email']);
  assert.equal(hasErrors(errors), true);
  assert.equal(hasErrors({}), false);
});
