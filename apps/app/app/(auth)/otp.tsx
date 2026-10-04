import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button, Input, Card } from '@campus/ui';
import { colors, spacing, typography } from '@campus/design-tokens';
import { useRouter } from 'expo-router';

export default function OtpScreen() {
  const [code, setCode] = useState('');
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Verify OTP</Text>
        <Input
          label="6-Digit Verification Code"
          value={code}
          onChangeText={setCode}
          maxLength={6}
          keyboardType="numeric"
          placeholder="123456"
        />
        <Button label="Verify & Complete" onPress={() => router.replace('/(auth)/login')} />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.gray[50],
  },
  card: {
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.gray[900],
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
});
