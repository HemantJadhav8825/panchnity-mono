import { FeatureFlagsService } from '../feature-flags.service';
import { featureFlagService } from '../../config/feature-flags';

describe('Feature Flags Integration', () => {
  beforeEach(() => {
    featureFlagService.resetToDefaults();
  });

  it('should allow toggle via service layer', () => {
    FeatureFlagsService.updateFlag('ENABLE_TYPING_INDICATORS', false);
    expect(FeatureFlagsService.isEnabled('ENABLE_TYPING_INDICATORS')).toBe(false);
  });

  it('should affect getAllFlags output', () => {
    FeatureFlagsService.updateFlag('ENABLE_READ_RECEIPTS', false);
    const flags = FeatureFlagsService.getAllFlags();
    expect(flags.ENABLE_READ_RECEIPTS).toBe(false);
  });

  // Note: We can't easily test socket/message integration in unit tests 
  // without mocking significant parts of the system. 
  // Those are better covered by the manual verification plan or E2E tests.
});
