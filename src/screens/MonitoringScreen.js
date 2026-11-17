import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Constants from "expo-constants";
import { tokens } from "../theme/tokens.js";
import { TempOrb } from "../components/TempOrb.js";

const { color } = tokens;

export function MonitoringScreen() {
  const [readings, setReadings] = useState([]);
  const [activeThreshold, setActiveThreshold] = useState(30.0); // State khusus threshold aktif
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const backendUrl =
    Constants.expoConfig?.extra?.backendUrl || "http://localhost:5002";

  const fetchData = async () => {
    try {
      const resReadings = await fetch(`${backendUrl}/api/readings`);
      const textReadings = await resReadings.text();
      if (!textReadings.trim().startsWith("<")) {
        const parsedReadings = JSON.parse(textReadings);
        const listData = Array.isArray(parsedReadings)
          ? parsedReadings
          : Array.isArray(parsedReadings.data)
          ? parsedReadings.data
          : [];
        setReadings(listData);

        // Gunakan threshold dari data terbaru sebagai fallback awal
        if (listData.length > 0 && listData[0]?.threshold_value != null) {
          setActiveThreshold(Number(listData[0].threshold_value));
        }
      }

      const resThreshold = await fetch(`${backendUrl}/api/thresholds`);
      const textThreshold = await resThreshold.text();
      if (!textThreshold.trim().startsWith("<")) {
        const parsedThresh = JSON.parse(textThreshold);
        const threshObj = Array.isArray(parsedThresh)
          ? parsedThresh[0]
          : parsedThresh?.data || parsedThresh;

        const val =
          threshObj?.threshold_value ??
          threshObj?.value ??
          threshObj?.threshold;

        if (val !== undefined && val !== null) {
          setActiveThreshold(Number(val));
        }
      }
    } catch (error) {
      console.error("Gagal mengambil data sensor/threshold:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchData();
  };

  const totalPages = Math.max(1, Math.ceil((readings?.length || 0) / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = Array.isArray(readings)
    ? readings.slice(startIndex, startIndex + itemsPerPage)
    : [];

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const latestReading = readings && readings.length > 0 ? readings[0] : null;
  const currentTemp =
    latestReading?.temperature !== undefined
      ? Number(latestReading.temperature)
      : 25.0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={color.primary}
        />
      }
    >
      <View style={styles.orbCard}>
        <TempOrb temperature={currentTemp} threshold={activeThreshold} />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Riwayat Pembacaan Sensor</Text>
        <Text style={styles.totalDataText}>Total: {readings.length} data</Text>
      </View>

      {loading && readings.length === 0 ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={color.primary} />
          <Text style={styles.loadingText}>Memuat data sensor...</Text>
        </View>
      ) : readings.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="cloud-offline-outline" size={40} color={color.text2} />
          <Text style={styles.emptyText}>Belum ada data sensor tercatat.</Text>
        </View>
      ) : (
        <>
          {currentItems.map((item, index) => (
            <View key={item?.id || index} style={styles.historyCard}>
              <View style={styles.historyLeft}>
                <Ionicons name="pulse" size={20} color={color.primary} />
                <View style={styles.historyTextGroup}>
                  <Text style={styles.historyTemp}>
                    {item?.temperature !== undefined
                      ? `${Number(item.temperature).toFixed(2)}°C`
                      : "--°C"}
                  </Text>
                  <Text style={styles.historyTime}>
                    {item?.recorded_at
                      ? new Date(item.recorded_at).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })
                      : "--:--:--"}
                  </Text>
                </View>
              </View>
              <View style={styles.historyBadge}>
                <Text style={styles.historyBadgeText}>
                  Batas: {item?.threshold_value ?? activeThreshold}°C
                </Text>
              </View>
            </View>
          ))}

          {/* Tombol Navigasi Pagination */}
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
              onPress={handlePrevPage}
              disabled={currentPage === 1}
            >
              <Ionicons
                name="chevron-back"
                size={16}
                color={currentPage === 1 ? color.text2 : color.bg}
              />
              <Text
                style={[
                  styles.pageBtnText,
                  currentPage === 1 && styles.pageBtnTextDisabled,
                ]}
              >
                Sebelumnya
              </Text>
            </TouchableOpacity>

            <Text style={styles.pageInfo}>
              Hal {currentPage} / {totalPages}
            </Text>

            <TouchableOpacity
              style={[
                styles.pageBtn,
                currentPage === totalPages && styles.pageBtnDisabled,
              ]}
              onPress={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <Text
                style={[
                  styles.pageBtnText,
                  currentPage === totalPages && styles.pageBtnTextDisabled,
                ]}
              >
                Berikutnya
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={currentPage === totalPages ? color.text2 : color.bg}
              />
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
}

export default MonitoringScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.bg,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  orbCard: {
    backgroundColor: color.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: color.border,
    marginBottom: 16,
  },
  heroCard: {
    backgroundColor: color.surface,
    borderRadius: 14,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: color.border,
    marginBottom: 24,
  },
  heroIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: color.bg,
    borderWidth: 1.5,
    borderColor: color.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  heroInfo: {
    flex: 1,
  },
  heroLabel: {
    fontSize: 12,
    color: color.text2,
    textTransform: "uppercase",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  heroValue: {
    fontSize: 26,
    fontWeight: "700",
    color: color.text,
    fontFamily: "monospace",
    marginVertical: 2,
  },
  heroThreshold: {
    fontSize: 13,
    color: color.text2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: color.text,
  },
  totalDataText: {
    fontSize: 12,
    color: color.text2,
    fontFamily: "monospace",
  },
  centerBox: {
    paddingVertical: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: color.text2,
    fontSize: 13,
  },
  emptyBox: {
    paddingVertical: 40,
    alignItems: "center",
    backgroundColor: color.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: color.border,
  },
  emptyText: {
    marginTop: 10,
    color: color.text2,
    fontSize: 13,
  },
  historyCard: {
    backgroundColor: color.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: color.border,
  },
  historyLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  historyTextGroup: {
    marginLeft: 12,
    flex: 1,
  },
  historyTemp: {
    fontSize: 16,
    fontWeight: "700",
    color: color.text,
    fontFamily: "monospace",
  },
  historyTime: {
    fontSize: 11,
    color: color.text2,
    marginTop: 2,
  },
  historyBadge: {
    backgroundColor: color.bg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: color.border,
  },
  historyBadgeText: {
    fontSize: 11,
    color: color.text2,
    fontFamily: "monospace",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: color.border,
  },
  pageBtn: {
    backgroundColor: color.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  pageBtnDisabled: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
  },
  pageBtnText: {
    color: color.bg,
    fontWeight: "600",
    fontSize: 12,
    marginHorizontal: 4,
  },
  pageBtnTextDisabled: {
    color: color.text2,
  },
  pageInfo: {
    color: color.text2,
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "monospace",
  },
});