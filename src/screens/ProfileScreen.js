import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { tokens } from "../theme/tokens.js";

const { color } = tokens;

const GROUP_DATA = {
  namaKelompok: "Kelompok 06",
  praktikum: "Praktikum Pemrograman Perangkat Bergerak",
  modul: "Modul 6 - React Native & IoT Monitoring",
  anggota: [
    { nama: "Bernard Ivan Salim", nim: "21120124120002"},
    { nama: "Sharon Tabitha Santoso", nim: "21120124120016"},
    { nama: "Nurul Kumala", nim: "21120124140113"},
    { nama: "Dinda Azra Ariefah", nim: "21120124120039"},
  ],
};

export function ProfileScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <View style={styles.iconCircle}>
          <Ionicons name="people" size={30} color={color.primary} />
        </View>
        <Text style={styles.groupName}>{GROUP_DATA.namaKelompok}</Text>
        <Text style={styles.courseName}>{GROUP_DATA.praktikum}</Text>
        <Text style={styles.moduleName}>{GROUP_DATA.modul}</Text>
      </View>

      <Text style={styles.sectionTitle}>Daftar Anggota Kelompok</Text>

      {GROUP_DATA.anggota.map((item, idx) => (
        <View key={idx} style={styles.memberCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.nama.charAt(0)}</Text>
          </View>
          <View style={styles.memberDetail}>
            <Text style={styles.memberName}>{item.nama}</Text>
            <Text style={styles.memberNim}>NIM: {item.nim}</Text>
            <Text style={styles.memberRole}>{item.peran}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.bg,
  },
  content: {
    padding: 16,
  },
  headerCard: {
    backgroundColor: color.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: color.border,
    marginBottom: 20,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: color.bg,
    borderWidth: 1,
    borderColor: color.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  groupName: {
    fontSize: 20,
    fontWeight: "700",
    color: color.text,
  },
  courseName: {
    fontSize: 13,
    fontWeight: "600",
    color: color.primary,
    marginTop: 4,
    textAlign: "center",
  },
  moduleName: {
    fontSize: 12,
    color: color.text2,
    marginTop: 2,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: color.text,
    marginBottom: 10,
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: color.border,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: color.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 17,
    fontWeight: "700",
    color: color.bg,
  },
  memberDetail: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: "600",
    color: color.text,
  },
  memberNim: {
    fontSize: 12,
    color: color.text2,
    marginTop: 2,
  },
  memberRole: {
    fontSize: 12,
    color: color.primary,
    marginTop: 2,
  },
});