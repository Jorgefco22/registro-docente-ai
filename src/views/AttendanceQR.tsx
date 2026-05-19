import React, { useState, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import type { Student } from '../data/demoData';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Capacitor } from '@capacitor/core';

interface AttendanceQRProps {
  students: Student[];
  onScanSuccess: (studentId: string) => void;
  onBack: () => void;
}

const playBeepSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = 880; // Beep frequency
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
  } catch {
    // Fallback if audio context is blocked
  }
};

export const AttendanceQR: React.FC<AttendanceQRProps> = ({
  students,
  onScanSuccess,
  onBack
}) => {
  const [scanning, setScanning] = useState(true);
  const [scannedStudent, setScannedStudent] = useState<Student | null>(null);
  const [laserPosition, setLaserPosition] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isNative] = useState(() => Capacitor.isNativePlatform());

  // Laser scanner animation (only active in UI)
  useEffect(() => {
    if (!scanning) return;
    const interval = setInterval(() => {
      setLaserPosition(prev => (prev === 0 ? 100 : 0));
    }, 1500);

    return () => clearInterval(interval);
  }, [scanning]);

  // Clean up scanner states on unmount
  useEffect(() => {
    return () => {
      if (Capacitor.isNativePlatform()) {
        document.body.classList.remove('qr-scanner-active');
        BarcodeScanner.showBackground();
        BarcodeScanner.stopScan();
      }
    };
  }, []);

  // Hybrid Scanning Engine
  useEffect(() => {
    if (!scanning) return;
    setError(null);

    if (Capacitor.isNativePlatform()) {
      // NATIVE DISPOSITIVO ESCANER (iOS / Android)
      const startNativeScan = async () => {
        try {
          // 1. Verify / Request camera permissions
          const status = await BarcodeScanner.checkPermission({ force: true });
          if (!status.granted) {
            setError('Permiso de cámara denegado. Por favor, habilítalo en los ajustes del dispositivo.');
            return;
          }

          // 2. Hide webview background to reveal native camera feed
          document.body.classList.add('qr-scanner-active');
          await BarcodeScanner.hideBackground();

          // 3. Start scanning
          const result = await BarcodeScanner.startScan();

          // 4. Restore background
          document.body.classList.remove('qr-scanner-active');
          await BarcodeScanner.showBackground();

          if (result.hasContent) {
            const rawContent = result.content?.trim() || '';
            
            // Search student match (by ID, or exact name match)
            const matchedStudent = students.find(
              s => s.id === rawContent || s.name.toLowerCase() === rawContent.toLowerCase()
            );

            setScanning(false);
            if (matchedStudent) {
              setScannedStudent(matchedStudent);
              onScanSuccess(matchedStudent.id);
            } else {
              setError(`Código QR escaneado: "${rawContent}". Pero no pertenece a ningún alumno registrado en este grupo.`);
            }
            playBeepSound();
          }
        } catch (err) {
          console.error('Error al escanear nativo:', err);
          document.body.classList.remove('qr-scanner-active');
          await BarcodeScanner.showBackground();
          setError('Ocurrió un error al activar la cámara nativa.');
        }
      };

      startNativeScan();
    } else {
      // SIMULATION EN WEB (MODO DEMO/LOCAL)
      if (students.length === 0) return;
      const timeout = setTimeout(() => {
        // Pick random student for simulation
        const randomIndex = Math.floor(Math.random() * students.length);
        const student = students[randomIndex];
        
        setScanning(false);
        setScannedStudent(student);
        onScanSuccess(student.id);
        playBeepSound();
      }, 4000);

      return () => clearTimeout(timeout);
    }
  }, [scanning, students, onScanSuccess]);

  const handleReset = () => {
    setError(null);
    setScannedStudent(null);
    setScanning(true);
  };

  const handleBack = () => {
    if (Capacitor.isNativePlatform()) {
      document.body.classList.remove('qr-scanner-active');
      BarcodeScanner.showBackground();
      BarcodeScanner.stopScan();
    }
    onBack();
  };

  return (
    <div className="qr-scanner-container no-print">
      {/* Header */}
      <div className="qr-scanner-header">
        <button onClick={handleBack} className="btn-back-square">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h3>Asistencia Inteligente por Código QR</h3>
          <p>
            {isNative
              ? 'Apunta la cámara del dispositivo hacia el código QR del alumno'
              : 'Los alumnos registran su asistencia escaneando el código QR de la clase'}
          </p>
        </div>
      </div>

      {/* Viewport card */}
      <div className="qr-viewport-card">
        {error && (
          <div className="form-error-banner" style={{ margin: '0 0 20px 0' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {scanning ? (
          <div className={`camera-viewport ${isNative ? 'native-transparent' : ''}`}>
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
              <span>
                {isNative ? 'Cámara nativa activa' : 'Buscando Código QR del alumno...'}
              </span>
            </div>
          </div>
        ) : (
          <div className="scan-success-viewport">
            <div className="success-icon-bg">
              <CheckCircle size={48} className="success-check-pulse" />
            </div>
            <h3>{scannedStudent ? '¡Escaneo Exitoso!' : 'Escaneo Terminado'}</h3>
            
            {scannedStudent && (
              <div className="scanned-student-info">
                <span>Alumno Registrado</span>
                <h4>{scannedStudent.name}</h4>
                <p>{scannedStudent.email}</p>
                <div className="time-badge">
                  Asistencia: Presente a las {new Date().toLocaleTimeString()}
                </div>
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
          {isNative ? (
            <>
              <span>* Asegúrate de contar con buena iluminación escolar.</span>
              <span>* El alumno debe presentar su código de barras o código QR en su celular/tarjeta.</span>
            </>
          ) : (
            <>
              <span>* En producción nativa, la cámara real de la tablet/celular captura los pases.</span>
              <span>* Simulación activa en web: Generando escaneos automáticos de prueba para fines demostrativos.</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
