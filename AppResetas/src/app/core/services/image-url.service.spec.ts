import { ImageUrlService } from './image-url.service';

describe('ImageUrlService', () => {
  const service = new ImageUrlService();

  it('resolves a relative image path against a local API URL', () => {
    expect(service.resolve('/uploads/recetas/1.webp', 'http://localhost:3000/api/'))
      .toBe('http://localhost:3000/uploads/recetas/1.webp');
  });

  it('preserves the public Traefik prefix', () => {
    expect(service.resolve('/uploads/recetas/1.webp', 'https://example.test/comeserver/api/'))
      .toBe('https://example.test/comeserver/uploads/recetas/1.webp');
  });

  it('does not alter absolute URLs', () => {
    expect(service.resolve('https://cdn.example/recipe.webp')).toBe('https://cdn.example/recipe.webp');
  });
});
