import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { IonList } from '@ionic/react';
import './Tab1.css';
import RepoItem from '../components/RepoItem';

const Tab1: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Repositorios</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Repositorios</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonList>
          <RepoItem name="Repositorio 1" imageUrl="https://static.thenounproject.com/png/55430-200.png" />
          <RepoItem name="Repositorio 2" />
          <RepoItem name="Repositorio 3" imageUrl="https://static.thenounproject.com/png/390267-200.png" />
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
