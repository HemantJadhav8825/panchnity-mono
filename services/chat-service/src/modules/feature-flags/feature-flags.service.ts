import { featureFlagService, FeatureFlags } from '../../config/feature-flags';

export class FeatureFlagsService {
  /**
   * Get all feature flags
   */
  public static getAllFlags(): FeatureFlags {
    return featureFlagService.getAllFlags();
  }

  /**
   * Update a specific feature flag
   */
  public static updateFlag(flagName: keyof FeatureFlags, enabled: boolean): FeatureFlags {
    featureFlagService.setFlag(flagName, enabled);
    return featureFlagService.getAllFlags();
  }

  /**
   * Check if a specific flag is enabled
   */
  public static isEnabled(flagName: keyof FeatureFlags): boolean {
    return featureFlagService.isEnabled(flagName);
  }
}
