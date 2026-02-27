import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CircularTimer } from '@/components/CircularTimer';

describe('CircularTimer', () => {
  it('рендерит SVG с правильным stroke-dashoffset для прогресса 0', () => {
    const { container } = render(
      <CircularTimer progress={0} label="5" />
    );
    const circle = container.querySelector('circle[stroke-dasharray]');
    expect(circle).toBeInTheDocument();
    const circumference = (120 - 12 * 2) * 2 * Math.PI;
    expect(circle).toHaveAttribute('style', expect.stringContaining('stroke-dashoffset'));
    // progress 0 => strokeDashoffset = circumference
    expect(circle?.getAttribute('style')).toMatch(new RegExp(String(circumference)));
  });

  it('рендерит SVG с правильным stroke-dashoffset для прогресса 0.5', () => {
    const { container } = render(
      <CircularTimer progress={0.5} label="15" />
    );
    const circle = container.querySelector('circle[stroke-dasharray]');
    const circumference = (120 - 12 * 2) * 2 * Math.PI;
    const expectedOffset = circumference * 0.5;
    expect(circle?.getAttribute('style')).toBeDefined();
    const style = circle?.getAttribute('style') ?? '';
    const match = style.match(/stroke-dashoffset:\s*([\d.]+)/);
    expect(match).toBeTruthy();
    const offset = parseFloat(match![1]);
    expect(offset).toBeCloseTo(expectedOffset, 0);
  });

  it('рендерит SVG с правильным stroke-dashoffset для прогресса 1', () => {
    const { container } = render(
      <CircularTimer progress={1} label="0" />
    );
    const circle = container.querySelector('circle[stroke-dasharray]');
    // progress 1 => strokeDashoffset = 0
    expect(circle?.getAttribute('style')).toMatch(/stroke-dashoffset:\s*0/);
  });

  it('показывает label и sublabel', () => {
    render(<CircularTimer progress={0.5} label="30" subLabel="ОСТАЛОСЬ" />);
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('ОСТАЛОСЬ')).toBeInTheDocument();
  });

  it('показывает индикатор стороны (left/right) для двусторонних упражнений', () => {
    const { container } = render(
      <CircularTimer progress={0.5} label="15" biSided leftHalfActive={true} />
    );
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBe(2);
    // leftHalfActive=true: left half filled (SIDE_FILL), right half bg
    const leftPath = paths[0];
    expect(leftPath.getAttribute('fill')).toBe('#047857');
    expect(paths[1].getAttribute('fill')).toBe('#1e293b');
  });

  it('при leftHalfActive false — правая половина заполнена', () => {
    const { container } = render(
      <CircularTimer progress={0.5} label="15" biSided leftHalfActive={false} />
    );
    const paths = container.querySelectorAll('path');
    expect(paths[0].getAttribute('fill')).toBe('#1e293b');
    expect(paths[1].getAttribute('fill')).toBe('#047857');
  });
});
