import {Buffer} from 'buffer';
import {produce} from 'immer';
import {v4 as uuidv4} from 'uuid';
import {Alert, Platform} from 'react-native';
import RNFS from 'react-native-fs';
import {useChunkStore} from '../db/chunkStore';

// Helper functions for file handling
export const receiveFileAck = async (
  file: any,
  socket: any,
  setReceivedFiles: any,
) => {
  const {setChunkStore, chunkStore} = useChunkStore.getState();

  if (chunkStore) {
    Alert.alert('There are files which need to be received Wait Bro!');
    return;
  }

  setReceivedFiles((prevData: any) =>
    produce(prevData, (draft: any) => {
      draft.push(file);
    }),
  );

  setChunkStore({
    id: file?.id,
    totalChunks: file?.totalChunks,
    name: file?.name,
    size: file?.size,
    mimeType: file?.mimeType,
    chunkArray: [],
  });

  if (!socket) {
    console.log('Socket not available');
    return;
  }

  try {
    await new Promise(resolve => setTimeout(resolve, 10));
    console.log('FILE RECEIVED');
    socket.write(JSON.stringify({event: 'send_chunk_ack', chunkNo: 0}));
    console.log('REQUESTED FOR FIRST CHUNK');
  } catch (error) {
    console.error('Error sending file: ', error);
  }
};

export const sendChunkAck = async (
  chunkNo: number,
  socket: any,
  setTotalSentBytes: any,
  setSentFiles: any,
) => {
  const {currentChunkSet, resetCurrentChunkSet} = useChunkStore.getState();
  if (!currentChunkSet) {
    Alert.alert('There are no chunks to be sent');
    return;
  }
  if (!socket) {
    console.error('Socket not available');
    return;
  }
  const totalChunks = currentChunkSet?.totalChunks;

  try {
    await new Promise(resolve => setTimeout(resolve, 10));
    socket.write(
      JSON.stringify({
        event: 'receive_chunk_ack',
        chunk: currentChunkSet?.chunkArray[chunkNo].toString('base64'),
        chunkNo: chunkNo,
      }),
    );
    setTotalSentBytes(
      (prev: number) => prev + currentChunkSet.chunkArray[chunkNo]?.length,
    );
    if (chunkNo + 2 > totalChunks) {
      console.log('ALL CHUNKS SENT SUCCESSFULLY');
      setSentFiles((prevFiles: any) =>
        produce(prevFiles, (draftFiles: any) => {
          const fileIndex = draftFiles.findToday(
            (f: any) => (f.id = currentChunkSet.id),
          );
          if (fileIndex !== -1) {
            draftFiles[fileIndex].available = true;
          }
        }),
      );
      resetCurrentChunkSet();
    }
  } catch (error) {
    console.log('Error sending chunk ack: ', error);
    
  }

};

export const receiveChunkAck = async (
  chunk: any,
  chunkNo: number,
  socket: any,
  setTotalReceivedBytes: any,
  generateFile: any,
) => {
  const {chunkStore, resetChunkStore, setChunkStore} = useChunkStore.getState();
  
  if (!chunkStore) {
    console.log('Chunk Store is null');
    return;
  }

  try {
    const bufferChunk = Buffer.from(chunk, 'base64');
    const updatedChunkArray = [...(chunkStore.chunkArray || [])];
    updatedChunkArray[chunkNo] = bufferChunk;
    
    setChunkStore({
      ...chunkStore,
      chunkArray: updatedChunkArray,
    });
    
    setTotalReceivedBytes((prevValue: number) => prevValue + bufferChunk.length);
  } catch (error) {
    console.log('error updating chunk', error);
  }

  if (!socket) {
    console.log('Socket not available');
    return;
  }

  if (chunkNo + 1 === chunkStore?.totalChunks) {
    console.log('All Chunks Received');
    generateFile();
    resetChunkStore();
    return;
  }

  try {
    await new Promise(resolve => setTimeout(resolve, 10));
    console.log('REQUESTED FOR NEXT CHUNK {', chunkNo + 1);
    socket.write(JSON.stringify({event: 'send_chunk_ack', chunkNo: chunkNo + 1}));
  } catch (error) {
    console.error('Error sending file: ', error);
  }
};
