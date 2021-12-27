import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';

export const StyledButton = ({ style, title, onPress }) => (
    <View style={style}>
        <TouchableOpacity
            title={title}
            onPress={onPress}>

            <Text style={{
                textAlign: 'center',
                padding: 8,
            }}>{title}</Text>

        </TouchableOpacity>
    </View>
)