import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/Button';

describe('Button', () => {
  it('рендерит текст кнопки', () => {
    render(<Button>Нажать</Button>);
    expect(screen.getByRole('button', { name: /нажать/i })).toBeInTheDocument();
  });

  it('применяет CSS-классы для варианта primary', () => {
    render(<Button variant="primary">OK</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('bg-primary');
  });

  it('применяет CSS-классы для варианта secondary', () => {
    render(<Button variant="secondary">OK</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('bg-surface');
  });

  it('применяет CSS-классы для варианта danger', () => {
    render(<Button variant="danger">Удалить</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('bg-red-500');
  });

  it('применяет CSS-классы для варианта ghost', () => {
    render(<Button variant="ghost">Отмена</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('bg-transparent');
  });

  it('вызывает onClick при клике', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Клик</Button>);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('не вызывает onClick при disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Клик
      </Button>
    );
    await user.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('применяет fullWidth класс', () => {
    render(<Button fullWidth>Широкая</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('w-full');
  });
});
