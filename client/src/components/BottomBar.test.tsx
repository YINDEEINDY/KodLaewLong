import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../test/test-utils';
import { BottomBar } from './BottomBar';
import * as SelectionContext from '../context/SelectionContext';

// Mock the selection context
vi.mock('../context/SelectionContext', async () => {
  const actual = await vi.importActual('../context/SelectionContext');
  return {
    ...actual,
    useSelection: vi.fn(),
  };
});

describe('BottomBar', () => {
  const mockClearSelection = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when no items are selected', () => {
    vi.mocked(SelectionContext.useSelection).mockReturnValue({
      selectedApps: [],
      selectionCount: 0,
      isSelected: vi.fn(),
      toggleSelection: vi.fn(),
      clearSelection: mockClearSelection,
      importApps: vi.fn(),
    });

    const { container } = render(<BottomBar />);
    expect(container.firstChild).toBeNull();
  });

  it('should render when items are selected', () => {
    vi.mocked(SelectionContext.useSelection).mockReturnValue({
      selectedApps: [],
      selectionCount: 3,
      isSelected: vi.fn(),
      toggleSelection: vi.fn(),
      clearSelection: mockClearSelection,
      importApps: vi.fn(),
    });

    render(<BottomBar />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should display correct selection count', () => {
    vi.mocked(SelectionContext.useSelection).mockReturnValue({
      selectedApps: [],
      selectionCount: 5,
      isSelected: vi.fn(),
      toggleSelection: vi.fn(),
      clearSelection: mockClearSelection,
      importApps: vi.fn(),
    });

    render(<BottomBar />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should have a link to summary page', () => {
    vi.mocked(SelectionContext.useSelection).mockReturnValue({
      selectedApps: [],
      selectionCount: 2,
      isSelected: vi.fn(),
      toggleSelection: vi.fn(),
      clearSelection: mockClearSelection,
      importApps: vi.fn(),
    });

    render(<BottomBar />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/summary');
  });

  it('should call clearSelection when clear button is clicked', async () => {
    vi.mocked(SelectionContext.useSelection).mockReturnValue({
      selectedApps: [],
      selectionCount: 2,
      isSelected: vi.fn(),
      toggleSelection: vi.fn(),
      clearSelection: mockClearSelection,
      importApps: vi.fn(),
    });

    render(<BottomBar />);

    // Find and click the clear button (the button with X icon)
    const clearButton = screen.getByRole('button');
    clearButton.click();

    expect(mockClearSelection).toHaveBeenCalledTimes(1);
  });
});
