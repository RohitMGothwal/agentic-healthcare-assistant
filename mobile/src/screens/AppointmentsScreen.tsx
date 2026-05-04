import { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '../components/Icon';
import ThemedText from '../components/ThemedText';
import { appointmentsApi } from '../api/client';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';

type Appointment = {
  id: number;
  doctor_name: string;
  clinic_name: string;
  appointment_date: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
};

// Demo appointments with translation keys
const getDemoAppointments = (t: any): Appointment[] => [
  {
    id: 1,
    doctor_name: t('demoDoctor1'),
    clinic_name: t('demoClinic1'),
    appointment_date: new Date(Date.now() + 86400000 * 2).toISOString(),
    status: 'upcoming',
    notes: t('demoNotes1'),
  },
  {
    id: 2,
    doctor_name: t('demoDoctor2'),
    clinic_name: t('demoClinic2'),
    appointment_date: new Date(Date.now() + 86400000 * 5).toISOString(),
    status: 'upcoming',
    notes: t('demoNotes2'),
  },
  {
    id: 3,
    doctor_name: t('demoDoctor3'),
    clinic_name: t('demoClinic3'),
    appointment_date: new Date(Date.now() - 86400000 * 3).toISOString(),
    status: 'completed',
    notes: t('demoNotes3'),
  },
  {
    id: 4,
    doctor_name: t('demoDoctor4'),
    clinic_name: t('demoClinic4'),
    appointment_date: new Date(Date.now() - 86400000 * 10).toISOString(),
    status: 'cancelled',
    notes: t('demoNotes4'),
  },
];

export default function AppointmentsScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const DEMO_APPOINTMENTS = getDemoAppointments(t);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [doctorName, setDoctorName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  const loadAppointments = useCallback(async () => {
    try {
      const data = await appointmentsApi.getAll();
      // If no appointments from API, use demo data
      if (data.length === 0) {
        setAppointments(DEMO_APPOINTMENTS);
      } else {
        setAppointments(data);
      }
    } catch (err) {
      console.error('Failed to load appointments:', err);
      // Use demo data on error
      setAppointments(DEMO_APPOINTMENTS);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await loadAppointments();
      setIsLoading(false);
    };
    init();
  }, [loadAppointments]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadAppointments();
    setIsRefreshing(false);
  }, [loadAppointments]);

  const handleCreateAppointment = async () => {
    if (!doctorName.trim() || !clinicName.trim() || !date.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const appointmentDate = new Date(`${date}T${time || '09:00'}`);
      const newAppointment = {
        doctor_name: doctorName.trim(),
        clinic_name: clinicName.trim(),
        appointment_date: appointmentDate.toISOString(),
        status: 'upcoming' as const,
        notes: notes.trim() || undefined,
      };
      
      // Add to local state (in real app, would call API)
      const newId = Math.max(...appointments.map(a => a.id), 0) + 1;
      setAppointments(prev => [{
        id: newId,
        ...newAppointment,
      }, ...prev]);
      
      // Reset form and close modal
      setDoctorName('');
      setClinicName('');
      setDate('');
      setTime('');
      setNotes('');
      setModalVisible(false);
      
      Alert.alert('Success', 'Appointment created successfully!');
    } catch (err) {
      Alert.alert('Error', 'Failed to create appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAppointment = (id: number) => {
    Alert.alert(
      'Delete Appointment',
      'Are you sure you want to delete this appointment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setAppointments(prev => prev.filter(a => a.id !== id));
          },
        },
      ]
    );
  };

  const handleCancelAppointment = (id: number) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            setAppointments(prev =>
              prev.map(a =>
                a.id === id ? { ...a, status: 'cancelled' as const } : a
              )
            );
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return '#10b981';
      case 'completed':
        return '#3b82f6';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#94a3b8';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'calendar';
      case 'completed':
        return 'checkmark-circle';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const filteredAppointments = appointments.filter(a => {
    if (filter === 'all') return true;
    return a.status === filter;
  });

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={[styles.title, { color: colors.text }]}>{t('appointments')}</ThemedText>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {(['all', 'upcoming', 'completed', 'cancelled'] as const).map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterTab,
              {
                backgroundColor:
                  filter === status ? colors.primary : colors.card,
              },
            ]}
            onPress={() => setFilter(status)}
          >
            <ThemedText
              style={[
                styles.filterText,
                { color: filter === status ? '#fff' : colors.text },
              ]}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Appointments List */}
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {filteredAppointments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="calendar-outline"
              size={64}
              color={colors.textSecondary}
              style={styles.emptyIcon}
            />
            <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t('noAppointments')}
            </ThemedText>
            <TouchableOpacity
              style={[styles.createFirstButton, { borderColor: colors.primary }]}
              onPress={() => setModalVisible(true)}
            >
              <ThemedText style={{ color: colors.primary }}>
                Create Your First Appointment
              </ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          filteredAppointments.map((appointment) => (
            <View
              key={appointment.id}
              style={[styles.card, { backgroundColor: colors.card }]}
            >
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View style={styles.dateContainer}>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={colors.primary}
                  />
                  <ThemedText style={[styles.date, { color: colors.text }]}>
                    {formatDate(appointment.appointment_date)}
                  </ThemedText>
                  <ThemedText style={[styles.time, { color: colors.textSecondary }]}>
                    {formatTime(appointment.appointment_date)}
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(appointment.status) },
                  ]}
                >
                  <Ionicons
                    name={getStatusIcon(appointment.status)}
                    size={12}
                    color="#fff"
                    style={styles.statusIcon}
                  />
                  <ThemedText style={styles.statusText}>
                    {appointment.status}
                  </ThemedText>
                </View>
              </View>

              {/* Doctor Info */}
              <View style={styles.infoRow}>
                <Ionicons name="medical-outline" size={18} color={colors.primary} />
                <ThemedText style={[styles.doctor, { color: colors.text }]}>
                  {appointment.doctor_name}
                </ThemedText>
              </View>

              {/* Clinic Info */}
              <View style={styles.infoRow}>
                <Ionicons name="business-outline" size={18} color={colors.textSecondary} />
                <ThemedText style={[styles.clinic, { color: colors.textSecondary }]}>
                  {appointment.clinic_name}
                </ThemedText>
              </View>

              {/* Notes */}
              {appointment.notes && (
                <View style={styles.notesContainer}>
                  <Ionicons name="document-text-outline" size={16} color={colors.textSecondary} />
                  <ThemedText style={[styles.notes, { color: colors.textSecondary }]}>
                    {appointment.notes}
                  </ThemedText>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                {appointment.status === 'upcoming' && (
                  <>
                    <TouchableOpacity
                      style={[styles.actionButton, { borderColor: '#ef4444' }]}
                      onPress={() => handleCancelAppointment(appointment.id)}
                    >
                      <Ionicons name="close-circle-outline" size={16} color="#ef4444" />
                      <ThemedText style={[styles.actionButtonText, { color: '#ef4444' }]}>
                        Cancel
                      </ThemedText>
                    </TouchableOpacity>
                  </>
                )}
                <TouchableOpacity
                  style={[styles.actionButton, { borderColor: '#ef4444' }]}
                  onPress={() => handleDeleteAppointment(appointment.id)}
                >
                  <Ionicons name="trash-outline" size={16} color="#ef4444" />
                  <ThemedText style={[styles.actionButtonText, { color: '#ef4444' }]}>
                    Delete
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Create Appointment Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <ThemedText style={[styles.modalTitle, { color: colors.text }]}>
                New Appointment
              </ThemedText>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              {/* Doctor Name */}
              <View style={styles.formGroup}>
                <ThemedText style={[styles.label, { color: colors.text }]}>
                  Doctor Name *
                </ThemedText>
                <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Ionicons name="medical-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="e.g. Dr. Sarah Johnson"
                    placeholderTextColor={colors.textSecondary}
                    value={doctorName}
                    onChangeText={setDoctorName}
                  />
                </View>
              </View>

              {/* Clinic Name */}
              <View style={styles.formGroup}>
                <ThemedText style={[styles.label, { color: colors.text }]}>
                  Clinic/Hospital Name *
                </ThemedText>
                <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Ionicons name="business-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="e.g. City Heart Care Center"
                    placeholderTextColor={colors.textSecondary}
                    value={clinicName}
                    onChangeText={setClinicName}
                  />
                </View>
              </View>

              {/* Date & Time Row */}
              <View style={styles.formRow}>
                <View style={[styles.formGroup, styles.formGroupHalf]}>
                  <ThemedText style={[styles.label, { color: colors.text }]}>
                    Date *
                  </ThemedText>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={colors.textSecondary}
                      value={date}
                      onChangeText={setDate}
                    />
                  </View>
                </View>

                <View style={[styles.formGroup, styles.formGroupHalf]}>
                  <ThemedText style={[styles.label, { color: colors.text }]}>
                    Time
                  </ThemedText>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Ionicons name="time-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="HH:MM"
                      placeholderTextColor={colors.textSecondary}
                      value={time}
                      onChangeText={setTime}
                    />
                  </View>
                </View>
              </View>

              {/* Notes */}
              <View style={styles.formGroup}>
                <ThemedText style={[styles.label, { color: colors.text }]}>
                  Notes (Optional)
                </ThemedText>
                <View style={[styles.textAreaWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.textArea, { color: colors.text }]}
                    placeholder="Add any additional notes..."
                    placeholderTextColor={colors.textSecondary}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.primary }]}
                onPress={handleCreateAppointment}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ThemedText style={styles.submitButtonText}>
                    Create Appointment
                  </ThemedText>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: { fontSize: 28, fontWeight: 'bold' },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: { padding: 16 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20,
  },
  createFirstButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dateContainer: {
    flex: 1,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  time: {
    fontSize: 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
    color: '#fff',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  doctor: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
  },
  clinic: {
    fontSize: 14,
    flex: 1,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    gap: 8,
  },
  notes: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalScrollContent: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formGroupHalf: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
  },
  textAreaWrapper: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  textArea: {
    fontSize: 16,
    minHeight: 80,
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
