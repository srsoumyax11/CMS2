import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const BadComponent = () => {
  return (
    <View style={styles.badContainer}>
      <Text style={styles.badText}>Bad Component</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badContainer: {
    backgroundColor: '#ff0000', // hex color literal
    borderColor: 'rgb(0, 128, 255)', // rgb color literal
    width: 100, // raw number width
    height: 50, // raw number height
    minWidth: 44, // raw number minWidth
    minHeight: 44, // raw number minHeight
    padding: 10, // raw number padding
    margin: 8, // raw number margin
    gap: 12, // raw number gap
  },
  badText: {
    fontSize: 16, // raw number fontSize
    color: '#00ff00', // hex color literal
  },
});
