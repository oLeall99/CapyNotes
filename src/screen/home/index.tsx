import React from 'react';
import { StyleSheet, Text, View } from "react-native";

export function Home() {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>CapyNotes</Text>
                <Text style={styles.subtitle}>Seu assistente de produtividade</Text>
            </View> 
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ddd0c2",
        width: '100%',
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 60, // Espaço para o footer
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#554b46",
        fontFamily: 'Nunito',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: "#554b46",
        fontFamily: 'Nunito',
    },
});
