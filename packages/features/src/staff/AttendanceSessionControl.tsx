import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, Button } from '@campus/ui';
import { colors, spacing, typography } from '@campus/design-tokens';

export interface AttendanceSessionControlProps {
  classId?: string;
  onStartSession?: () => Promise<{ code: string; expiresInSeconds: number }>;
  onRefreshCode?: () => Promise<{ code: string; expiresInSeconds: number }>;
}

export const AttendanceSessionControl: React.FC<AttendanceSessionControlProps> = ({
  classId = 'CS101-Lec1',
  onStartSession,
  onRefreshCode,
}) => {
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(30);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  const generateNewCode = async () => {
    if (onRefreshCode) {
      const res = await onRefreshCode();
      setActiveCode(res.code);
      setCountdown(res.expiresInSeconds);
    } else {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setActiveCode(code);
      setCountdown(30);
    }
    setRefreshCount((prev) => prev + 1);
  };

  const handleStartSession = async () => {
    if (onStartSession) {
      const res = await onStartSession();
      setActiveCode(res.code);
      setCountdown(res.expiresInSeconds);
    } else {
      await generateNewCode();
    }
    setIsSessionActive(true);
  };

  useEffect(() => {
    if (!isSessionActive || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          generateNewCode(); // Auto refresh code before/on expiry
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSessionActive, countdown]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.sessionCard}>
        <Text style={styles.cardHeader}>Faculty Attendance Code Broadcast</Text>
        <Text style={styles.classText}>Active Class: {classId}</Text>

        {!isSessionActive ? (
          <Button
            label="Start Attendance Session"
            onPress={handleStartSession}
            testID="btn-start-attendance-session"
          />
        ) : (
          <View style={styles.activeCodeBox}>
            <Text style={styles.codeLabel}>6-Digit Rotating Attendance Code</Text>
            <Text style={styles.codeDisplay} testID="rotating-attendance-code">
              {activeCode}
            </Text>
            <Text style={styles.timerText} testID="code-countdown-timer">
              Auto Refreshes in: {countdown}s (Refreshed: {refreshCount}x)
            </Text>

            <Button
              label="Force Refresh Code Now"
              variant="secondary"
              onPress={generateNewCode}
              testID="btn-force-refresh-code"
            />
          </View>
        )}
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  content: { padding: spacing.md },
  sessionCard: { padding: spacing.lg, backgroundColor: colors.primary[50] },
  cardHeader: { fontSize: typography.fontSize.lg, fontWeight: 'bold', color: colors.primary[900] },
  classText: { fontSize: typography.fontSize.sm, color: colors.primary[700], marginVertical: spacing.xs },
  activeCodeBox: { alignItems: 'center', marginVertical: spacing.md, gap: spacing.sm },
  codeLabel: { fontSize: typography.fontSize.xs, color: colors.primary[800], fontWeight: 'bold' },
  codeDisplay: { fontSize: typography.fontSize['3xl'], fontWeight: 'bold', letterSpacing: 6, color: colors.primary[900] },
  timerText: { fontSize: typography.fontSize.xs, color: colors.primary[700], fontWeight: 'bold' },
});
