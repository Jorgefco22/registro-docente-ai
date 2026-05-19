import React, { useState, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import type { Student } from '../data/demoData';

interface AttendanceQRProps {
  students: Student[];
  onScanSuccess: (studentId: string) => void;
  onBack: () => void;
}

export const AttendanceQR: React.FC<AttendanceQRProps> = ({
  students,
  onScanSuccess,
  onBack
}) => {
  const [scanning, setScanning] = useState(true);
  const [scannedStudent, setScannedStudent] = useState<Student | null>(null);
  const [laserPosition, setLaserPosition] = useState(0);

  // Laser scanner animation
  useEffect(() => {
    if (!scanning) return;
    const interval = setInterval(() => {
      setLaserPosition(prev => (prev === 0 ? 100 : 0));
    }, 1500);

    return () => clearInterval(interval);
  }, [scanning]);

  // Simulate scanning one student after a few seconds
  useEffect(() => {
    if (!scanning || students.length === 0) return;
    
    const timeout = setTimeout(() => {
      // Pick a random student
      const randomIndex = Math.floor(Math.random() * students.length);
      const student = students[randomIndex];
      
      setScanning(false);
      setScannedStudent(student);
      onScanSuccess(student.id);

      // Play mock beep sound
      try {
        const audioCtx = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.value = 880; // High frequency beep
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
      } catch {
        // Fallback if audio context blocked or unsupported
      }
    }, 4000);

    return () => clearTimeout(timeout);
  }, [scanning, students, onScanSuccess]);

  const handleReset = () => {
    setScanning(true);
    setScannedStudent(null);
  };

  return (
    <div className="qr-scanner-container no-print">
      {/* Header */}
      <div className="qr-scanner-header">
        <button onClick={onBack} className="btn-back-square">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h3>Asistencia Inteligente por Código QR</h3>
          <p>Los alumnos registran su asistencia escaneando el código QR de la clase</p>
        </div>
      </div>

      {/* Simulator view */}
      <div className="qr-viewport-card">
        {scanning ? (
          <div className="camera-viewport">
            {/* Target lines */}
            <div className="scanner-target-corners">
              <div className="corner tl"></div>
              <div className="corner tr"></div>
              <div className="corner bl"></div>
              <div className="corner br"></div>
            </div>
            
            {/* Animated Laser Bar */}
            <div 
              className="scanner-laser" 
              style={{ top: `${laserPosition}%` }}
            ></div>

            <div className="scanner-details-overlay">
              <Camera size={36} className="cam-pulse-icon" />
              <span>Buscando Código QR del alumno...</span>
            </div>
          </div>
        ) : (
          <div className="scan-success-viewport">
            <div className="success-icon-bg">
              <CheckCircle size={48} className="success-check-pulse" />
            </div>
            <h3>¡Escaneo Exitoso!</h3>
            
            {scannedStudent && (
              <div className="scanned-student-info">
                <span>Alumno Registrado</span>
                <h4>{scannedStudent.name}</h4>
                <p>{scannedStudent.email}</p>
                <div className="time-badge">Asistencia: Presente a las {new Date().toLocaleTimeString()}</div>
              </div>
            )}

            <button 
              onClick={handleReset}
              className="btn btn-secondary btn-full"
              style={{ marginTop: '20px' }}
            >
              <RefreshCw size={16} />
              <span>Escanear Otro Código</span>
            </button>
          </div>
        )}
      </div>

      <div className="scanner-tips-card">
        <AlertCircle size={16} className="tip-alert-icon" />
        <div className="tips-list">
          <span>* En producción, la cámara de la tablet/celular capturará los pases individuales.</span>
          <span>* Simulación activa: Generando escaneos automáticos de prueba para fines demostrativos.</span>
        </div>
      </div>
    </div>
  );
};
