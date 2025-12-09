import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import {
  Skeleton,
  CardSkeleton,
  TableSkeleton,
  TableRowSkeleton,
  AppCardSkeleton,
  AppListSkeleton,
  ProfileSkeleton,
  DashboardStatsSkeleton,
} from './Skeleton';

describe('Skeleton', () => {
  it('should render with default props', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.firstChild as HTMLElement;

    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('bg-gray-200');
    expect(skeleton).toHaveClass('animate-pulse');
    expect(skeleton).toHaveClass('rounded'); // text variant
  });

  it('should apply text variant classes', () => {
    const { container } = render(<Skeleton variant="text" />);
    const skeleton = container.firstChild as HTMLElement;

    expect(skeleton).toHaveClass('rounded');
    expect(skeleton).toHaveClass('h-4');
  });

  it('should apply circular variant classes', () => {
    const { container } = render(<Skeleton variant="circular" />);
    const skeleton = container.firstChild as HTMLElement;

    expect(skeleton).toHaveClass('rounded-full');
  });

  it('should apply rectangular variant classes', () => {
    const { container } = render(<Skeleton variant="rectangular" />);
    const skeleton = container.firstChild as HTMLElement;

    expect(skeleton).not.toHaveClass('rounded');
    expect(skeleton).not.toHaveClass('rounded-full');
    expect(skeleton).not.toHaveClass('rounded-xl');
  });

  it('should apply rounded variant classes', () => {
    const { container } = render(<Skeleton variant="rounded" />);
    const skeleton = container.firstChild as HTMLElement;

    expect(skeleton).toHaveClass('rounded-xl');
  });

  it('should apply pulse animation by default', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.firstChild as HTMLElement;

    expect(skeleton).toHaveClass('animate-pulse');
  });

  it('should apply wave animation when specified', () => {
    const { container } = render(<Skeleton animation="wave" />);
    const skeleton = container.firstChild as HTMLElement;

    expect(skeleton).toHaveClass('animate-shimmer');
  });

  it('should apply no animation when specified', () => {
    const { container } = render(<Skeleton animation="none" />);
    const skeleton = container.firstChild as HTMLElement;

    expect(skeleton).not.toHaveClass('animate-pulse');
    expect(skeleton).not.toHaveClass('animate-shimmer');
  });

  it('should apply custom width and height', () => {
    const { container } = render(<Skeleton width={100} height={50} />);
    const skeleton = container.firstChild as HTMLElement;

    expect(skeleton).toHaveStyle({ width: '100px', height: '50px' });
  });

  it('should apply custom width and height as strings', () => {
    const { container } = render(<Skeleton width="50%" height="2rem" />);
    const skeleton = container.firstChild as HTMLElement;

    expect(skeleton).toHaveStyle({ width: '50%', height: '2rem' });
  });

  it('should apply custom className', () => {
    const { container } = render(<Skeleton className="custom-class" />);
    const skeleton = container.firstChild as HTMLElement;

    expect(skeleton).toHaveClass('custom-class');
  });

  it('should have aria-hidden attribute', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.firstChild as HTMLElement;

    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('CardSkeleton', () => {
  it('should render card skeleton structure', () => {
    const { container } = render(<CardSkeleton />);

    expect(container.querySelector('.bg-white')).toBeInTheDocument();
    expect(container.querySelector('.rounded-2xl')).toBeInTheDocument();
  });
});

describe('TableRowSkeleton', () => {
  it('should render correct number of columns', () => {
    const { container } = render(
      <table>
        <tbody>
          <TableRowSkeleton columns={5} />
        </tbody>
      </table>
    );

    const cells = container.querySelectorAll('td');
    expect(cells).toHaveLength(5);
  });

  it('should render default 5 columns', () => {
    const { container } = render(
      <table>
        <tbody>
          <TableRowSkeleton />
        </tbody>
      </table>
    );

    const cells = container.querySelectorAll('td');
    expect(cells).toHaveLength(5);
  });
});

describe('TableSkeleton', () => {
  it('should render header and rows', () => {
    const { container } = render(<TableSkeleton rows={3} columns={4} />);

    const headerCells = container.querySelectorAll('th');
    const bodyCells = container.querySelectorAll('td');

    expect(headerCells).toHaveLength(4);
    expect(bodyCells).toHaveLength(12); // 3 rows * 4 columns
  });

  it('should render default 5 rows and 5 columns', () => {
    const { container } = render(<TableSkeleton />);

    const headerCells = container.querySelectorAll('th');
    const bodyCells = container.querySelectorAll('td');

    expect(headerCells).toHaveLength(5);
    expect(bodyCells).toHaveLength(25); // 5 rows * 5 columns
  });
});

describe('AppCardSkeleton', () => {
  it('should render app card structure', () => {
    const { container } = render(<AppCardSkeleton />);

    expect(container.querySelector('.bg-white')).toBeInTheDocument();
    expect(container.querySelector('.rounded-2xl')).toBeInTheDocument();
  });
});

describe('AppListSkeleton', () => {
  it('should render default 6 app cards', () => {
    const { container } = render(<AppListSkeleton />);

    const cards = container.querySelectorAll('.bg-white');
    expect(cards).toHaveLength(6);
  });

  it('should render specified number of app cards', () => {
    const { container } = render(<AppListSkeleton count={3} />);

    const cards = container.querySelectorAll('.bg-white');
    expect(cards).toHaveLength(3);
  });
});

describe('ProfileSkeleton', () => {
  it('should render profile skeleton sections', () => {
    const { container } = render(<ProfileSkeleton />);

    // Should have at least 2 card sections (avatar + form)
    const sections = container.querySelectorAll('.bg-white');
    expect(sections.length).toBeGreaterThanOrEqual(2);
  });
});

describe('DashboardStatsSkeleton', () => {
  it('should render 4 stat cards', () => {
    const { container } = render(<DashboardStatsSkeleton />);

    const cards = container.querySelectorAll('.bg-white');
    expect(cards).toHaveLength(4);
  });
});
