import React from 'react';
import { Button, View } from 'react-native';

export const StyledButton = ({ style, title, onPress }) => (
    <View style={style}>
        <Button
            title={title}
            onPress={onPress}
        />
    </View>
)