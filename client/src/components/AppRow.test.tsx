import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../test/test-utils';
import { AppRow } from './AppRow';
import * as SelectionContext from '../context/SelectionContext';
import * as FavoritesContext from '../context/FavoritesContext';
import * as PopularAppsContext from '../context/PopularAppsContext';
import { mockApp } from '../test/test-utils';

// Mock contexts
vi.mock('../context/SelectionContext', async () => {
  const actual = await vi.importActual('../context/SelectionContext');
  return {
    ...actual,
    useSelection: vi.fn(),
  };
});

vi.mock('../context/FavoritesContext', async () => {
  const actual = await vi.importActual('../context/FavoritesContext');
  return {
    ...actual,
    useFavorites: vi.fn(),
  };
});

vi.mock('../context/PopularAppsContext', async () => {
  const actual = await vi.importActual('../context/PopularAppsContext');
  return {
    ...actual,
    usePopularApps: vi.fn(),
  };
});

describe('AppRow', () => {
  const mockToggleSelection = vi.fn();
  const mockToggleFavorite = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(SelectionContext.useSelection).mockReturnValue({
      selectedApps: [],
      selectionCount: 0,
      isSelected: vi.fn().mockReturnValue(false),
      toggleSelection: mockToggleSelection,
      clearSelection: vi.fn(),
      importApps: vi.fn(),
    });

    vi.mocked(FavoritesContext.useFavorites).mockReturnValue({
      favorites: [],
      isFavorite: vi.fn().mockReturnValue(false),
      toggleFavorite: mockToggleFavorite,
      clearFavorites: vi.fn(),
    });

    vi.mocked(PopularAppsContext.usePopularApps).mockReturnValue({
      popularAppIds: [],
      isPopular: vi.fn().mockReturnValue(false),
      loading: false,
      error: null,
    });
  });

  it('should render app name', () => {
    render(<AppRow app={mockApp} />);
    expect(screen.getByText(mockApp.name)).toBeInTheDocument();
  });

  it('should render app description', () => {
    render(<AppRow app={mockApp} />);
    expect(screen.getByText(mockApp.description)).toBeInTheDocument();
  });

  it('should render license badge', () => {
    render(<AppRow app={mockApp} />);
    // FREE license should show the free text (from i18n)
    expect(screen.getByText(/free|ฟรี/i)).toBeInTheDocument();
  });

  it('should toggle selection when clicked', () => {
    render(<AppRow app={mockApp} />);

    // Click on the row (the main div)
    const row = screen.getByText(mockApp.name).closest('div[class*="cursor-pointer"]');
    if (row) {
      fireEvent.click(row);
    }

    expect(mockToggleSelection).toHaveBeenCalledWith(mockApp);
  });

  it('should show selected state when app is selected', () => {
    vi.mocked(SelectionContext.useSelection).mockReturnValue({
      selectedApps: [mockApp],
      selectionCount: 1,
      isSelected: vi.fn().mockReturnValue(true),
      toggleSelection: mockToggleSelection,
      clearSelection: vi.fn(),
      importApps: vi.fn(),
    });

    render(<AppRow app={mockApp} />);

    // Check for the selected styling (indigo background)
    const row = screen.getByText(mockApp.name).closest('div[class*="cursor-pointer"]');
    expect(row).toHaveClass('bg-indigo-50');
  });

  it('should toggle favorite when heart button is clicked', () => {
    render(<AppRow app={mockApp} />);

    // Find the favorite button (has a heart icon)
    const buttons = screen.getAllByRole('button');
    const favoriteButton = buttons.find((btn) =>
      btn.querySelector('svg[viewBox="0 0 24 24"]')
    );

    if (favoriteButton) {
      fireEvent.click(favoriteButton);
    }

    expect(mockToggleFavorite).toHaveBeenCalledWith(mockApp.id);
  });

  it('should render PAID badge for paid apps', () => {
    const paidApp = { ...mockApp, licenseType: 'PAID' as const };
    render(<AppRow app={paidApp} />);

    expect(screen.getByText(/paid|เสียเงิน/i)).toBeInTheDocument();
  });

  it('should render FREEMIUM badge for freemium apps', () => {
    const freemiumApp = { ...mockApp, licenseType: 'FREEMIUM' as const };
    render(<AppRow app={freemiumApp} />);

    expect(screen.getByText(/freemium|ฟรีเมียม/i)).toBeInTheDocument();
  });

  it('should link to app detail page', () => {
    render(<AppRow app={mockApp} />);

    const detailLink = screen.getByRole('link', { hidden: true });
    expect(detailLink).toHaveAttribute('href', `/apps/${mockApp.id}`);
  });
});
