import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";
import SearchBar  from '../../components/search';
import Footer from '../../components/footer';

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

export function Home() {
    return (
        <>
            <StatusBar barStyle="dark-content" />
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>CapyNotes</Text>
                </View> 
            </SafeAreaView>
        </>
    )
}
