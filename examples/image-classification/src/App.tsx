import ImageClassifier from './components/ImageClassifier';
import { Flex, Heading, Text, View } from '@adobe/react-spectrum';
import { LiteRtProvider } from 'react-litert';

function App() {
  return (
    <LiteRtProvider
      config={{
        wasmRoot: '/litert-wasm/',
        preferAccelerators: ['webgpu', 'wasm'],
        tfBackend: 'webgpu',
        autoShareWebGpuWithTfjs: true,
      }}
    >
      <View
        height="100vh"
        backgroundColor="gray-200"
        UNSAFE_style={{ overflow: 'auto', minHeight: '100vh' }}
      >
        <View padding="size-400">
          <Flex direction="column" gap="size-300" maxWidth="1200px" margin="0 auto">
            <View backgroundColor="gray-75" borderRadius="medium" padding="size-300">
              <Heading level={1} marginBottom="size-100">
                Image Classification
              </Heading>
              <Text slot="description">
                MobileNet V2 inference powered by <strong>react-litert</strong>
              </Text>
            </View>
            <ImageClassifier />
          </Flex>
        </View>
      </View>
    </LiteRtProvider>
  );
}

export default App;
