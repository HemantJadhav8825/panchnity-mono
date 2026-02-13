/**
 * Feature Flags Service
 * 
 * Centralized feature flag management for runtime toggleability.
 * Flags can be updated without redeployment via admin API.
 */

export interface FeatureFlags {
  ENABLE_TYPING_INDICATORS: boolean;
  ENABLE_READ_RECEIPTS: boolean;
  SANCTUARY_ENABLED: boolean;
}

class FeatureFlagService {
  private static instance: FeatureFlagService;
  private flags: FeatureFlags;

  private constructor() {
    // Initialize with defaults from environment or fallback to true
    this.flags = {
      ENABLE_TYPING_INDICATORS: this.parseEnvFlag('ENABLE_TYPING_INDICATORS', true),
      ENABLE_READ_RECEIPTS: this.parseEnvFlag('ENABLE_READ_RECEIPTS', true),
      SANCTUARY_ENABLED: this.parseEnvFlag('SANCTUARY_ENABLED', false),
    };
  }

  public static getInstance(): FeatureFlagService {
    if (!FeatureFlagService.instance) {
      FeatureFlagService.instance = new FeatureFlagService();
    }
    return FeatureFlagService.instance;
  }

  /**
   * Parse environment variable as boolean with fallback
   */
  private parseEnvFlag(key: string, defaultValue: boolean): boolean {
    const value = process.env[key];
    if (value === undefined) return defaultValue;
    return value.toLowerCase() === 'true';
  }

  /**
   * Get current value of a feature flag
   */
  public isEnabled(flag: keyof FeatureFlags): boolean {
    return this.flags[flag];
  }

  /**
   * Update a feature flag at runtime
   */
  public setFlag(flag: keyof FeatureFlags, enabled: boolean): void {
    this.flags[flag] = enabled;
  }

  /**
   * Get all feature flags
   */
  public getAllFlags(): FeatureFlags {
    return { ...this.flags };
  }

  /**
   * Reset all flags to defaults
   */
  public resetToDefaults(): void {
    this.flags = {
      ENABLE_TYPING_INDICATORS: true,
      ENABLE_READ_RECEIPTS: true,
      SANCTUARY_ENABLED: false, // Default to false for v0
    };
  }
}

export const featureFlagService = FeatureFlagService.getInstance();
