import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScreenAbout } from '@/components/ScreenAbout';

describe('ScreenAbout', () => {
  const onBack = vi.fn();

  it('рендерит описание приложения', () => {
    render(<ScreenAbout onBack={onBack} />);

    expect(screen.getByText(/Circuit Forge/)).toBeInTheDocument();
    expect(screen.getByText(/интервальные тренировки|HIIT/)).toBeInTheDocument();
    expect(screen.getByText(/подбираются 3 группы мышц/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'О приложении' })).toBeInTheDocument();
  });

  it('кнопка «Назад» вызывает onBack', async () => {
    const user = userEvent.setup();
    render(<ScreenAbout onBack={onBack} />);

    const backButtons = screen.getAllByRole('button', { name: /назад/i });
    await user.click(backButtons[0]);

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
