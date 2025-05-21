import React from 'react';
import { StyleSheet, Text, View } from "react-native";

export function Home() {
    return (
        <>
            <View style={styles.header}>
                <Text style={styles.title}>CapyNaotes</Text>
            </View> 
        </>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ddd0c2",
    },
    header: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#554b46",
    },
});
