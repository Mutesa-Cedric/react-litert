import { imagenetClasses } from '../utils/imagenetClasses';
import { Badge, Button, Flex, Heading, ProgressCircle, Text, View } from '@adobe/react-spectrum';
import * as tf from '@tensorflow/tfjs-core';
import { useState } from 'react';
import { useLiteRtTfjsModel } from 'react-litert';

interface Prediction {
  label: string;
  confidence: number;
}

export default function ImageClassifier() {
  const { status, run, error, accelerator } = useLiteRtTfjsModel({
    modelUrl: '/models/mobilenet_v2_1.0_224.tflite',
    id: 'mobilenet-v2',
  });

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isClassifying, setIsClassifying] = useState(false);

  const preprocessImage = async (imageElement: HTMLImageElement): Promise<tf.Tensor4D> => {
    const tensor = tf.browser.fromPixels(imageElement);
    const resized = tf.image.resizeBilinear(tensor, [224, 224]);
    const normalized = tf.div(tf.sub(resized, 127.5), 127.5);
    const batched = tf.expandDims(normalized, 0) as tf.Tensor4D;

    tensor.dispose();
    resized.dispose();
    normalized.dispose();

    return batched;
  };

  const classifyImage = async (file: File) => {
    if (status !== 'ready' || !run) return;

    setIsClassifying(true);
    setPredictions([]);

    try {
      const imageUrl = URL.createObjectURL(file);
      setImageUrl(imageUrl);

      const img = new Image();
      img.src = imageUrl;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const inputTensor = await preprocessImage(img);
      const output = await run(inputTensor);

      let outputTensor: tf.Tensor;
      if (Array.isArray(output)) {
        outputTensor = output[0];
      } else if (output && typeof output === 'object' && 'data' in output) {
        outputTensor = output as tf.Tensor;
      } else {
        throw new Error(`Unexpected output format: ${typeof output}`);
      }

      const logits = await outputTensor.data();

      const predictions: Prediction[] = Array.from(logits)
        .map((confidence, index) => ({
          label: imagenetClasses[index] || `Class ${index}`,
          confidence: confidence,
        }))
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5);

      setPredictions(predictions);

      inputTensor.dispose();
      outputTensor.dispose();
    } catch (err) {
      console.error('Classification error:', err);
    } finally {
      setIsClassifying(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      classifyImage(file);
    }
  };

  const handleClear = () => {
    setImageUrl(null);
    setPredictions([]);
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
  };

  const isReady = status === 'ready';

  return (
    <View backgroundColor="gray-75" borderRadius="medium" borderWidth="thin" borderColor="gray-400">
      <Flex direction="column" gap="size-300">
        <View padding="size-300" borderBottomWidth="thin" borderColor="gray-400">
          <Flex gap="size-200" wrap alignItems="center">
            <Badge
              variant={
                status === 'ready' ? 'positive' : status === 'error' ? 'negative' : 'neutral'
              }
            >
              {status.toUpperCase()}
            </Badge>
            {accelerator ? (
              <Badge variant="info">{accelerator.toUpperCase()}</Badge>
            ) : status === 'ready' ? (
              <Badge variant="neutral">-</Badge>
            ) : null}
          </Flex>
        </View>

        <View padding="size-300">
          <Flex direction="column" gap="size-400">
            {error && (
              <View
                backgroundColor="negative"
                padding="size-300"
                borderRadius="medium"
                borderWidth="thin"
                borderColor="red-500"
              >
                <Text>
                  <strong>Error:</strong> {error.message}
                </Text>
              </View>
            )}

            {!imageUrl && (
              <div
                onClick={isReady ? () => document.getElementById('file-input')?.click() : undefined}
                style={{ cursor: isReady ? 'pointer' : 'not-allowed' }}
              >
                <View
                  borderRadius="medium"
                  padding="size-800"
                  borderWidth="thick"
                  borderColor="gray-500"
                  backgroundColor="gray-300"
                  UNSAFE_style={{
                    borderStyle: 'dashed',
                    opacity: isReady ? 1 : 0.6,
                  }}
                >
                  <Flex direction="column" alignItems="center" gap="size-300">
                    <View
                      width="size-600"
                      height="size-600"
                      backgroundColor="gray-500"
                      UNSAFE_style={{
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </View>
                    <Heading level={3} marginTop="size-0">
                      Upload Image
                    </Heading>
                    <Text>Click to select or drag and drop</Text>
                    <Button
                      variant="cta"
                      onPress={() => document.getElementById('file-input')?.click()}
                      isDisabled={!isReady}
                      marginTop="size-100"
                    >
                      Select File
                    </Button>
                    <input
                      id="file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                      disabled={!isReady}
                    />
                  </Flex>
                </View>
              </div>
            )}

            {imageUrl && !isClassifying && predictions.length > 0 && (
              <Flex direction="column" gap="size-400">
                <Flex gap="size-400" wrap="wrap">
                  <View
                    flex="1"
                    minWidth="300px"
                    borderRadius="medium"
                    overflow="hidden"
                    borderWidth="thin"
                    borderColor="gray-500"
                    backgroundColor="gray-300"
                  >
                    <img
                      src={imageUrl}
                      alt="Uploaded"
                      style={{
                        width: '100%',
                        display: 'block',
                        maxHeight: '500px',
                        objectFit: 'contain',
                      }}
                    />
                  </View>

                  <View
                    flex="1"
                    minWidth="300px"
                    backgroundColor="gray-200"
                    borderRadius="medium"
                    padding="size-300"
                  >
                    <Flex direction="column" gap="size-200">
                      <Heading level={4} marginTop="size-0">
                        Results
                      </Heading>
                      {predictions.map((pred, idx) => (
                        <View
                          key={idx}
                          backgroundColor="gray-300"
                          borderRadius="small"
                          padding="size-200"
                          borderWidth="thin"
                          borderColor="gray-500"
                        >
                          <Flex direction="column" gap="size-100">
                            <Flex justifyContent="space-between" alignItems="center">
                              <Text>{pred.label}</Text>
                              <Text UNSAFE_style={{ fontWeight: 600 }}>
                                {(pred.confidence * 100).toFixed(1)}%
                              </Text>
                            </Flex>
                            <View
                              borderRadius="small"
                              height="size-50"
                              backgroundColor="gray-500"
                              overflow="hidden"
                            >
                              <View
                                height="100%"
                                width={`${pred.confidence * 100}%`}
                                backgroundColor={idx === 0 ? 'blue-500' : 'gray-600'}
                                UNSAFE_style={{
                                  transition: 'width 0.5s ease',
                                }}
                              />
                            </View>
                          </Flex>
                        </View>
                      ))}
                    </Flex>
                  </View>
                </Flex>

                <Button variant="secondary" onPress={handleClear} UNSAFE_style={{ width: '100%' }}>
                  Clear & Upload New Image
                </Button>
              </Flex>
            )}

            {isClassifying && (
              <View padding="size-800">
                <Flex direction="column" alignItems="center" gap="size-300">
                  <ProgressCircle aria-label="Classifying" isIndeterminate size="L" />
                  <Text>Analyzing image...</Text>
                </Flex>
              </View>
            )}
          </Flex>
        </View>
      </Flex>
    </View>
  );
}
