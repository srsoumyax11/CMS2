import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@campus/design-tokens';
import { Button } from '@campus/ui';
import { AppError } from '@campus/api-client';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  requestId: string | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    requestId: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    const requestId = error instanceof AppError ? error.requestId || null : null;
    return { hasError: true, error, requestId };
  }

  public componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {
    // Log unexpected errors
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, requestId: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {this.state.error?.message || 'An unexpected application error occurred.'}
          </Text>
          {this.state.requestId ? (
            <Text style={styles.requestId}>Request ID: {this.state.requestId}</Text>
          ) : null}
          <View style={styles.buttonWrapper}>
            <Button label="Try Again" onPress={this.handleReset} variant="primary" />
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  message: {
    fontSize: typography.fontSize.base,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  requestId: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[400],
    marginBottom: spacing.lg,
  },
  buttonWrapper: {
    marginTop: spacing.md,
  },
});
