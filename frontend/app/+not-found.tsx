import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Page Not Found' }} />
      <View style={styles.container}>
        <Text style={styles.title}>404 - Screen Doesn't Exist</Text>
        <Text style={styles.subtitle}>The requested page or route could not be found.</Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Return to Campus Home</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#0F172A',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 24,
    textAlign: 'center',
  },
  link: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  linkText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
