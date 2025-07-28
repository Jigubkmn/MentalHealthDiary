import React from 'react'
import { Tabs, useRouter } from 'expo-router'
import UserIcon from '../components/Icon/UserIcon'
import HomeIcon from '../components/Icon/HomeIcon'
import DiaryCreationIcon from '../components/Icon/DiaryCreationIcon'
import AnalysisIcon from '../components/Icon/AnalysisIcon'
import HeartIcon from '../components/Icon/HeartIcon'

export default function TabLayout() {

  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FFA500',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
        },
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "日記一覧",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <HomeIcon size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="diaryCreation"
        options={{
          title: "日記作成",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <DiaryCreationIcon size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push({
              pathname: '/diaryCreation',
              params: {
                isShowBackButton: 'false',
                isTouchFeelingButton: 'true'
              }
            });
          },
        }}
      />
      <Tabs.Screen
        name="analysis"
        options={{
          title: "分析レポート",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <AnalysisIcon width={size} height={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="mentalHealthCheckList"
        options={{
          title: "メンタルヘルスチェック一覧",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <HeartIcon size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="myPage"
        options={{
          title: "マイページ",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <UserIcon size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
