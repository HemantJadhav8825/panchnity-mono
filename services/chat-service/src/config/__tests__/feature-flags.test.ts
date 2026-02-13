import { featureFlagService } from '../feature-flags';

describe('FeatureFlagService', () => {
  beforeEach(() => {
    // Reset flags before each test
    featureFlagService.resetToDefaults();
  });

  it('should initialize with default values', () => {
    const flags = featureFlagService.getAllFlags();
    expect(flags.ENABLE_TYPING_INDICATORS).toBe(true);
    expect(flags.ENABLE_READ_RECEIPTS).toBe(true);
  });

  it('should allow updating flags at runtime', () => {
    featureFlagService.setFlag('ENABLE_TYPING_INDICATORS', false);
    expect(featureFlagService.isEnabled('ENABLE_TYPING_INDICATORS')).toBe(false);

    featureFlagService.setFlag('ENABLE_TYPING_INDICATORS', true);
    expect(featureFlagService.isEnabled('ENABLE_TYPING_INDICATORS')).toBe(true);
  });

  it('should persist flag state across calls', () => {
    featureFlagService.setFlag('ENABLE_READ_RECEIPTS', false);
    const flags = featureFlagService.getAllFlags();
    expect(flags.ENABLE_READ_RECEIPTS).toBe(false);
  });

  it('should return all flags correctly', () => {
    const flags = featureFlagService.getAllFlags();
    expect(Object.keys(flags)).toContain('ENABLE_TYPING_INDICATORS');
    expect(Object.keys(flags)).toContain('ENABLE_READ_RECEIPTS');
  });
});
