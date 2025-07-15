import React from 'react'
import { View, Text, StyleSheet } from 'react-native';
import { feelings } from '../../constants/feelings';
import FeelingView from '../Feeling/FeelingView';
import SelectedFeelingButton from '../Feeling/SelectedFeelingButton';

type Props = {
  selectedFeeling: string | null;
  setSelectedFeeling: (feeling: string | null) => void;
  isTouchFeelingButton: boolean;
}

export default function Feeling({ selectedFeeling, setSelectedFeeling, isTouchFeelingButton }: Props) {
  const handleFeelingSelect = (feelingName: string) => {
    setSelectedFeeling(feelingName);
  };

  return (
    <View>
      <Text style={styles.question}>どのような1日でしたか？</Text>
      <View style={styles.feelingsContainer}>
        {feelings.map((feeling) => (
          isTouchFeelingButton ? (
            <SelectedFeelingButton key={feeling.name} selectedFeeling={selectedFeeling} handleFeelingSelect={handleFeelingSelect} name={feeling.name} image={feeling.image} />
          ) : (
          <FeelingView key={feeling.name} selectedFeeling={selectedFeeling} name={feeling.name} image={feeling.image} />
          )
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  question: {
    fontSize: 16,
    lineHeight: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  feelingsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 40,
  },
  feelingItem: {
    alignItems: 'center',
  },
  feelingImage: {
    width: 40,
    height: 40,
  },
  feelingText: {
    fontSize: 14,
    lineHeight: 24,
  },
});
