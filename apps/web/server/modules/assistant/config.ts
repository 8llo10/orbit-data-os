export const assistantConfig={
  maxMessageChars:4000,
  maxHistoryTurns:12,
  maxProviderContextCollections:12,
  maxProviderSampleRowsPerCollection:4,
  providerTimeoutMs:20000,
  providerTemperature:0.1,
  providerMaxTokens:1400
} as const;

export function providerConfigured(){
  return Boolean(process.env.AI_API_URL&&process.env.AI_API_KEY&&process.env.AI_MODEL);
}
