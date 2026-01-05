import './RepoItem.css';
import React from 'react';
import {
  IonItem,
  IonLabel,
  IonThumbnail,
} from '@ionic/react';

interface RepoProps {
  name: string;
  imageUrl?: string;
}

const RepoItem: React.FC<RepoProps> = ({ name, imageUrl }) => {
  return (
    <IonItem>
      {imageUrl && (
        <IonThumbnail slot="start">
          <img alt="Avatar" src={imageUrl} />
        </IonThumbnail>
      )}
      {!imageUrl && (
        <IonThumbnail slot="start">
          <img alt="Silhouette of mountains" src={"https://ionicframework.com/docs/img/demos/thumbnail.svg"} />
        </IonThumbnail>
      )}
      <IonLabel>{name}</IonLabel>
    </IonItem>
  );
};

export default RepoItem;
