import { execSync } from 'child_process';
import path from 'path';

describe('ESLint Custom Rule Negative Tests (Restricted Syntax)', () => {
  it('catches hex colors, rgb(), and raw numeric size values in bad UI components', () => {
    const fixturePath = path.resolve(__dirname, './fixtures/bad-ui-component.tsx');
    let output = '';

    try {
      execSync(`npx eslint --no-ignore "${fixturePath}"`, {
        cwd: path.resolve(__dirname, '../../../'),
        encoding: 'utf8',
        stdio: 'pipe',
      });
    } catch (err: unknown) {
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      output = (err as any).stdout || (err as any).stderr || '';
    }

    expect(output.length).toBeGreaterThan(0);

    // Hex and RGB color literal bans
    expect(output).toMatch(/Raw color literals/);

    // Raw numeric size bans (width, height, minWidth, minHeight, padding, margin, fontSize, gap)
    expect(output).toMatch(/Raw numeric size values are prohibited/);
  });
});
