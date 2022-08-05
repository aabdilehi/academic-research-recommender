function embed(data) {
  let tensor = tf.tensor(data).expandDims()
  const prediction = vecmodel.predict(tensor).dataSync();
  return prediction
}

function cosineSimilarity(A,B){
    let dotproduct=0;
    let mA=0;
    let mB=0;
    for(i = 0; i < A.length; i++){ // here you missed the i++
        dotproduct += (A[i] * B[i]);
        mA += (A[i]*A[i]);
        mB += (B[i]*B[i]);
    }
    mA = Math.sqrt(mA);
    mB = Math.sqrt(mB);
    let similarity = (dotproduct)/(mA*mB) // here you needed extra brackets
    return 1 - Math.acos(similarity)/1.5708;
}

function calculateSimilarity() {
  let embeddedQuery = embed(tokenisedArray);
  for (var i = 0; i < result.length; i++) {
    result[i]['similarity'] = cosineSimilarity(embeddedQuery, JSON.parse(result[i].vector));
  }
}
