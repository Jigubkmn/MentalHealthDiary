import React from 'react'
import { Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Link } from 'expo-router'

type Props = {
  text: string
  href: string
  color?: string
}

export default function AuthNavigationLink({ text, href, color = '#26B441' }: Props) {
  return (
    <Link href={href} asChild>
      <TouchableOpacity style={styles.touchable}>
        <Text style={[styles.loginLinkText, { color }]}>{text}</Text>
      </TouchableOpacity>
    </Link>
  )
}

const styles = StyleSheet.create({
  touchable: {
    alignSelf: 'center',
  },
  loginLinkText: {
    fontSize: 14,
    lineHeight : 24,
    textDecorationLine: 'underline',
    alignSelf: 'center',
  },
})