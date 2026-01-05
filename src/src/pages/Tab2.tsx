import { IonButton, IonContent, IonHeader, IonPage, IonTextarea, IonTitle, IonToolbar } from '@ionic/react';
import { IonInput } from '@ionic/react';
import './Tab2.css';
import { useState } from 'react';
import { createRepo } from '../../services/github';
import { useHistory } from 'react-router-dom';

const Tab2: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const history = useHistory();

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    if (!name || name.trim().length === 0) {
      setError('El nombre es obligatorio');
      return;
    }
    setLoading(true);
    try {
      await createRepo({ name: name.trim(), description: description.trim() || undefined });
      setSuccess('Repositorio creado exitosamente');
      setName('');
      setDescription('');
      try { window.dispatchEvent(new CustomEvent('repoCreated')); } catch (e) { /* noop */ }
      setTimeout(() => history.push('/tab1'), 400);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Error al crear repositorio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Formulario de repositorio</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Formulario de repositorio</IonTitle>
          </IonToolbar>
        </IonHeader>
        <div className="form-container">
          <IonInput
            value={name}
            onIonChange={(e: any) => setName(e.detail.value)}
            className="form-field"
            label="Nombre del repositorio"
            labelPlacement="floating"
            fill="outline"
            placeholder="android-project"
          ></IonInput>
          <IonTextarea
            value={description}
            onIonChange={(e: any) => setDescription(e.detail.value)}
            className="form-field"
            label="Descripción del repositorio"
            labelPlacement="floating"
            fill="outline"
            placeholder="Descripción del repositorio"
            rows={6}
            autoGrow
          ></IonTextarea>
          {loading && <div className="loading">Creando repositorio...</div>}
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
          <IonButton expand="block" className="form-field" onClick={handleSubmit} disabled={loading}>Guardar</IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
