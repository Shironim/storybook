import { render, fireEvent } from 'react-testing-library';
import { withText, withCounter } from './button.stories';

const mockAction = jest.fn();
jest.mock('@storybook/addon-actions', () => ({
  action: () => mockAction,
}));

describe('module story embedding', () => {
  it('should test actions', () => {
    const comp = render(withText());
    fireEvent.click(comp.getByText('Hello Button'));
    expect(mockAction).toHaveBeenCalled();
  });

  it('should test story state', () => {
    const comp = render(withCounter());
    fireEvent.click(comp.getByText('Testing: 0'));
    expect(comp.getByText('Testing: 1')).toBeTruthy();
  });
});
