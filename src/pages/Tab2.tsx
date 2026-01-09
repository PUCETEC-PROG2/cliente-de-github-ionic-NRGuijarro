import { IonButton, IonContent, IonHeader, IonPage, IonTextarea, IonTitle, IonToolbar, IonRefresher, IonRefresherContent } from '@ionic/react';
import { IonInput } from '@ionic/react';
import './Tab2.css';
import { useState } from 'react';
import { createRepo } from '../services/github';
import { useHistory } from 'react-router-dom';
import { useIonViewWillEnter } from '@ionic/react';
import { RefresherEventDetail } from '@ionic/react';

const Tab2: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const history = useHistory();

  // Limpiar mensajes al entrar a la vista
  useIonViewWillEnter(() => {
    setError(null);
    setSuccess(null);
  });

  const handleRefresh = (event: CustomEvent<RefresherEventDetail>) => {
    // Limpiar el formulario y mensajes
    setName('');
    setDescription('');
    setError(null);
    setSuccess(null);
    event.detail.complete();
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    if (!name || name.trim().length === 0) {
      setError('El nombre es obligatorio');
      return;
    }
    setLoading(true);
    try {
      const created = await createRepo({ name: name.trim(), description: description.trim() || undefined });
      console.log('Repo creado:', created);
      setSuccess('Repositorio creado exitosamente');
      setName('');
      setDescription('');
      // Emitir evento para notificar a la lista de repos que se refresque
      try {
        window.dispatchEvent(new CustomEvent('repoCreated', { detail: created }));
      } catch (e) {
        console.error('Error dispatching event:', e);
      }
      // Navegar de regreso a la lista de repos después de un pequeño delay
      setTimeout(() => history.push('/tab1'), 500);
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error(String(e));
      setError(error.message || 'Error al crear repositorio');
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
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Formulario de repositorio</IonTitle>
          </IonToolbar>
        </IonHeader>
        <div className="form-container">
          <IonInput
            value={name}
            onIonChange={(e) => setName(String(e.detail.value || ''))}
            className="form-field"
            label="Nombre del repositorio"
            labelPlacement="floating"
            fill="outline"
            placeholder="android-project"
          ></IonInput>
          <IonTextarea
            value={description}
            onIonChange={(e) => setDescription(String(e.detail.value || ''))}
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
