import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

const Footer = () => {
  return (
    <View style={styles.footer}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.brandSection}>
            <Text style={styles.brandName}>MERN Store</Text>
            <Text style={styles.tagline}>Premium shopping experience on mobile.</Text>
          </View>
          
          <View style={styles.links}>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.link}>Terms</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.link}>Privacy</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.link}>Support</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.copyright}>
          <Text style={styles.copyrightText}>
            © {new Date().getFullYear()} MERN Store. All rights reserved.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 20,
    paddingVertical: 32,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  container: {
    width: '100%',
    alignSelf: 'center',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  brandSection: {
    flex: 1.2,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  tagline: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  links: {
    flexDirection: 'row',
    gap: 16,
    flex: 1,
    justifyContent: 'flex-end',
  },
  link: {
    color: theme.colors.primaryLight,
    fontSize: 12,
    fontWeight: '600',
  },
  copyright: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.03)',
    paddingTop: 16,
  },
  copyrightText: {
    color: theme.colors.textMuted,
    fontSize: 11,
  },
});

export default Footer;