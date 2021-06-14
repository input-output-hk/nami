/**
 * BerryPool implementation of the __Random-Improve__ coin selection algorithm.
 *
 * = Overview
 *
 * The __Random-Improve__ coin selection algorithm works in __two phases__, by
 * /first/ selecting UTxO entries /at random/ to pay for each of the given
 * outputs, and /then/ attempting to /improve/ upon each of the selections.
 *
 * === Phase 1: Random Selection
 *
 * __In this phase, the algorithm randomly selects a minimal set of UTxO__
 * __entries to pay for each of the given outputs.__
 *
 * During this phase, the algorithm:
 *
 *   *  processes outputs in /descending order of coin value/.
 *
 *   *  maintains a /remaining UTxO set/, initially equal to the given
 *      /UTxO set/ parameter.
 *
 *   *  based on every output nature, generate a /native token UTxO subset/
 *      to narrow down to useful UTxO
 *
 *   *  maintains an /accumulated coin selection/, which is initially /empty/.
 *
 * For each output of value __/v/__, the algorithm /randomly/ selects entries
 * from the /remaining UTxO set/, until the total value of selected entries is
 * greater than or equal to __/v/__. The selected entries are then associated
 * with that output, and removed from the /remaining UTxO set/.
 *
 * This phase ends when every output has been associated with a selection of
 * UTxO entries.
 *
 * However, if the remaining UTxO set is completely exhausted before all
 * outputs can be processed, the algorithm terminates with an error.
 *
 * === Phase 2: Improvement
 *
 * __In this phase, the algorithm attempts to improve upon each of the UTxO__
 * __selections made in the previous phase, by conservatively expanding the__
 * __selection made for each output.__
 *
 * During this phase, the algorithm:
 *
 *   *  processes outputs in /ascending order of coin value/.
 *
 *   *  continues to maintain the /remaining UTxO set/ produced by the previous
 *      phase.
 *
 *   *  maintains an /accumulated coin selection/, initiated from previous phase.
 *
 * For each output of value __/v/__, the algorithm:
 *
 *  1.  __Calculates a /target range/__ for the total value of inputs used to
 *      pay for that output, defined by the triplet:
 *
 *      (/minimum/, /ideal/, /maximum/) = (/v/, /2v/, /3v/)
 *
 *  2.  __Attempts to /improve/ upon the /existing UTxO selection/__ for that
 *      output, by repeatedly selecting additional entries at random from the
 *      /remaining UTxO set/, stopping when the selection can be improved upon
 *      no further.
 *
 *      A selection with value /v1/ is considered to be an /improvement/ over a
 *      selection with value /v0/ if __all__ of the following conditions are
 *      satisfied:
 *
 *       * __Condition 1__: we have moved closer to the /ideal/ value:
 *
 *             abs (/ideal/ − /v1/) < abs (/ideal/ − /v0/)
 *
 *       * __Condition 2__: we have not exceeded the /maximum/ value:
 *
 *             /v1/ ≤ /maximum/
 *
 *       * __Condition 3__: when counting cumulatively across all outputs
 *       considered so far, we have not selected more than the /maximum/ number
 *       of UTxO entries specified by 'limit'.
 *
 *  3.  __Creates a /change value/__ for the output, equal to the total value
 *      of the /final UTxO selection/ for that output minus the value /v/ of
 *      that output.
 *
 *  4.  __Updates the /accumulated coin selection/__:
 *
 *       * Adds the /output/ to 'outputs'.
 *       * Adds the /improved UTxO selection/ to 'inputs'.
 *       * Adds the /change value/ to 'change'.
 *
 * This phase ends when every output has been processed, __or__ when the
 * /remaining UTxO set/ has been exhausted, whichever occurs sooner.
 *
 * = Termination
 *
 * When both phases are complete, the algorithm terminates.
 *
 * The /accumulated coin selection/ and /remaining UTxO set/ are returned to
 * the caller.
 *
 * === Failure Modes
 *
 * The algorithm terminates with an __error__ if:
 *
 *  1.  The /total value/ of the initial UTxO set (the amount of money
 *      /available/) is /less than/ the total value of the output list (the
 *      amount of money /required/).
 *
 *      See: __'InputsExhaustedError'__.
 *
 *  2.  The /number/ of UTxO entries needed to pay for the requested outputs
 *      would /exceed/ the upper limit specified by 'limit'.
 *
 *      See: __'InputLimitExceededError'__.
 *
 * == Motivating Principles
 *
 * There are several motivating principles behind the design of the algorithm.
 *
 * === Principle 1: Dust Management
 *
 * The probability that random selection will choose dust entries from a UTxO
 * set increases with the proportion of dust in the set.
 *
 * Therefore, for a UTxO set with a large amount of dust, there's a high
 * probability that a random subset will include a large amount of dust.
 *
 * === Principle 2: Change Management
 *
 * Ideally, coin selection algorithms should, over time, create a UTxO set that
 * has /useful/ outputs: outputs that will allow us to process future payments
 * with a minimum number of inputs.
 *
 * If for each payment request of value __/v/__ we create a change output of
 * /roughly/ the same value __/v/__, then we will end up with a distribution of
 * change values that matches the typical value distribution of payment
 * requests.
 *
 * === Principle 3: Performance Management
 *
 * Searching the UTxO set for additional entries to improve our change outputs
 * is /only/ useful if the UTxO set contains entries that are sufficiently
 * small enough. But it is precisely when the UTxO set contains many small
 * entries that it is less likely for a randomly-chosen UTxO entry to push the
 * total above the upper bound.
 *
 * == UTxO BlockFrost API Format
 *
 * [
 *	{
 *		tx_hash: 'af84e14238ee97dbe3f7a3cc4dd8d0b2d23bade99a2e07e54f54f5f99f1424e5',
 *		tx_index: 0,
 *		output_index: 0,
 *		amount: [ { unit: 'lovelace', quantity: '1000000000' } ],
 *		block: '94180eb052c054584ff54fbdc2f09649744c3cbe055fb7d28140b51467f33ba3'
 *	}
 * ]
 *
 * == Outputs Format
 *
 * [
 *  {
 *    address: 'addr_test1qpndlx95xlnn8t(...)9n7d2qlvgrpngvvsggsysr',
 *    amount: [ { unit: 'lovelace', quantity: 1000000000 } ]
 *  }
 * ]
 *
 */

/**
 * @typedef {Object} Amount - Unit/Quantity pair
 * @property {string} unit - Token Type
 * @property {int} quantity - Token Amount
 */

/**
 * @typedef {Amount[]} AmountList - List of unit/quantity pair
 */

/**
 * @typedef {Object} UTxO - UTxO Format
 * @property {string} tx_hash - Transaction Hash
 * @property {int} tx_index - Transaction Index
 * @property {int} output_index - Output Index
 * @property {AmountList} amount - Amount (lovelace & Native Token)
 * @property {string} block - Block Hash
 */

/**
 * @typedef {Output[]} OutputList - List of Output
 */

/**
 * @typedef {Object} Output - Outputs Format
 * @property {string} address - Address Output
 * @property {AmountList} amount - Amount (lovelace & Native Token)
 */

/**
 * @typedef {UTxO[]} UTxOList - List of UTxO
 */

/**
 * @typedef {Object} UTxOSelection - Coin Selection algorithm core object
 * @property {UTxOList} selection - Accumulated UTxO set.
 * @property {UTxOList} remaining - Remaining UTxO set.
 * @property {UTxOList} subset - Remaining UTxO set.
 * @property {AmountList} amount - UTxO amount of each requested token
 * @property {AmountList} change - Accumulated change amount.
 */

/**
 * @typedef {Object} ImproveRange - ImproveRange
 * @property {int} ideal - Requested amount * 2
 * @property {int} maximum - Requested amount * 3
 */

/**
 * @typedef {Object} SelectionResult - Coin Selection algorithm return
 * @property {UTxOList} input - Accumulated UTxO set.
 * @property {OutputList} output - Requested outputs.
 * @property {UTxOList} remaining - Remaining UTxO set.
 * @property {AmountList} change - Accumulated change amount.
 */

/**
 * CoinSelection Module.
 * @module src/lib/CoinSelection
 */
export default {
  /**
   * Random-Improve coin selection algorithm
   * @param {UTxOList} inputsAvailable - The set of inputs available for selection.
   * @param {OutputList} outputsRequested - The set of outputs requested for payment.
   * @param {int} limit - A limit on the number of inputs that can be selected.
   * @param {int} minUTxOValue - Network protocol 'minUTxOValue' current value
   * @return {SelectionResult} - Coin Selection algorithm return
   */
  randomImprove: (inputsAvailable, outputsRequested, limit, minUTxOValue) => {
    /** @type {UTxOSelection} */
    let utxoSelection = {
      selection: [],
      remaining: [...inputsAvailable], // Shallow copy
      subset: [],
      amount: [],
      change: [],
    };

    let compiledOutputList = compileOutputs(outputsRequested);

    // Phase 1: RandomSelect
    compiledOutputList = sortAmountList(compiledOutputList, 'DESC');

    compiledOutputList.forEach((compiledOutput) => {
      createSubSet(utxoSelection, compiledOutput); // Narrow down for NatToken UTxO

      try {
        utxoSelection = randomSelect(
          JSON.parse(JSON.stringify(utxoSelection)), // Deep copy in case of fallback needed
          compiledOutput,
          limit - utxoSelection.selection.length,
          minUTxOValue
        );
      } catch (e) {
        if (e.message === 'INPUT_LIMIT_EXCEEDED') {
          // Limit reached : Fallback on DescOrdAlgo
          utxoSelection = descSelect(
            utxoSelection,
            compiledOutput,
            limit - utxoSelection.selection.length,
            minUTxOValue
          );
        } else {
          throw e;
        }
      }
    });

    // Phase 2: Improve
    compiledOutputList = sortAmountList(compiledOutputList);

    compiledOutputList.forEach((compiledOutput) => {
      createSubSet(utxoSelection, compiledOutput); // Narrow down for NatToken UTxO

      improve(
        utxoSelection,
        compiledOutput,
        limit - utxoSelection.selection.length,
        {
          ideal: BigInt(compiledOutput.quantity) * BigInt(2),
          maximum: BigInt(compiledOutput.quantity) * BigInt(3),
        }
      );
    });

    addChangeExtra(utxoSelection, compiledOutputList);

    return {
      input: utxoSelection.selection,
      output: outputsRequested,
      remaining: utxoSelection.remaining,
      change: utxoSelection.change,
    };
  },
};

/**
 * Randomly select enough UTxO to fulfill requested outputs
 * @param {UTxOSelection} utxoSelection - The set of selected/available inputs.
 * @param {Amount} compiledOutput - Single compiled output qty requested for payment.
 * @param {int} limit - A limit on the number of inputs that can be selected.
 * @param {int} minUTxOValue - Network protocol 'minUTxOValue' current value.
 * @throws INPUT_LIMIT_EXCEEDED if the number of randomly picked inputs exceed 'limit' parameter.
 * @throws INPUTS_EXHAUSTED if all UTxO doesn't hold enough funds to pay for output.
 * @throws MIN_UTXO_ERROR if lovelace change is under 'minUTxOValue' parameter.
 * @return {UTxOSelection} - Successful random utxo selection.
 */
function randomSelect(utxoSelection, compiledOutput, limit, minUTxOValue) {
  let compiledAmount = utxoSelection.amount.find(
    (amount) => amount.unit === compiledOutput.unit
  );

  // If quantity is met, return subset into remaining list and exit
  if (
    compiledAmount &&
    isQtyFulfilled(compiledOutput, compiledAmount, minUTxOValue)
  ) {
    utxoSelection.remaining = [
      ...utxoSelection.remaining,
      ...utxoSelection.subset,
    ];
    utxoSelection.subset = [];
    return utxoSelection;
  }

  if (limit <= 0) {
    throw new Error('INPUT_LIMIT_EXCEEDED');
  }

  let nbFreeUTxO = utxoSelection.subset.length;

  if (nbFreeUTxO <= 0) {
    if (isQtyFulfilled(compiledOutput, compiledAmount, 0)) {
      throw new Error('MIN_UTXO_ERROR');
    }
    throw new Error('INPUTS_EXHAUSTED');
  }

  /** @type {UTxO} utxo */
  let utxo = utxoSelection.subset
    .splice(Math.floor(Math.random() * nbFreeUTxO), 1)
    .pop();

  utxoSelection.selection.push(utxo);
  addAmounts(utxo.amount, utxoSelection.amount);

  return randomSelect(utxoSelection, compiledOutput, limit - 1, minUTxOValue);
}

/**
 * Select enough UTxO in DESC order to fulfill requested outputs
 * @param {UTxOSelection} utxoSelection - The set of selected/available inputs.
 * @param {Amount} compiledOutput - Single compiled output qty requested for payment.
 * @param {int} limit - A limit on the number of inputs that can be selected.
 * @param {int} minUTxOValue - Network protocol 'minUTxOValue' current value.
 * @throws INPUT_LIMIT_EXCEEDED if the number of randomly picked inputs exceed 'limit' parameter.
 * @throws INPUTS_EXHAUSTED if all UTxO doesn't hold enough funds to pay for output.
 * @throws MIN_UTXO_ERROR if lovelace change is under 'minUTxOValue' parameter.
 * @return {UTxOSelection} - Successful random utxo selection.
 */
function descSelect(utxoSelection, compiledOutput, limit, minUTxOValue) {
  // Sort UTxO subset in DESC order for required Output unit type
  utxoSelection.subset = utxoSelection.subset.sort((utxoA, utxoB) => {
    let a = utxoA.amount.find((amount) => amount.unit === compiledOutput.unit);
    let b = utxoB.amount.find((amount) => amount.unit === compiledOutput.unit);
    return (BigInt(a.quantity) - BigInt(b.quantity)) * BigInt(-1);
  });

  let compiledAmount = utxoSelection.amount.find(
    (amount) => amount.unit === compiledOutput.unit
  );

  do {
    if (limit <= 0) {
      throw new Error('INPUT_LIMIT_EXCEEDED');
    }

    if (utxoSelection.subset.length <= 0) {
      if (isQtyFulfilled(compiledOutput, compiledAmount, 0)) {
        throw new Error('MIN_UTXO_ERROR');
      }
      throw new Error('INPUTS_EXHAUSTED');
    }

    /** @type {UTxO} utxo */
    let utxo = utxoSelection.subset.splice(0, 1).pop();

    utxoSelection.selection.push(utxo);
    addAmounts(utxo.amount, utxoSelection.amount);

    if (!compiledAmount) {
      compiledAmount = utxoSelection.amount.find(
        (amount) => amount.unit === compiledOutput.unit
      );
    }

    limit--;
  } while (!isQtyFulfilled(compiledOutput, compiledAmount, minUTxOValue));

  // Quantity is met, return subset into remaining list and return selection
  utxoSelection.remaining = [
    ...utxoSelection.remaining,
    ...utxoSelection.subset,
  ];
  utxoSelection.subset = [];

  return utxoSelection;
}

/**
 * Try to improve selection by increasing input amount in [2x,3x] range.
 * @param {UTxOSelection} utxoSelection - The set of selected/available inputs.
 * @param {Amount} compiledOutput - Single compiled output qty requested for payment.
 * @param {int} limit - A limit on the number of inputs that can be selected.
 * @param {ImproveRange} range - Improvement range target values
 */
function improve(utxoSelection, compiledOutput, limit, range) {
  let nbFreeUTxO = utxoSelection.subset.length;

  let compiledAmount = utxoSelection.amount.find(
    (amount) => amount.unit === compiledOutput.unit
  );

  if (
    BigInt(compiledAmount.quantity) >= range.ideal ||
    nbFreeUTxO <= 0 ||
    limit <= 0
  ) {
    // Cannot improve further, calculate change
    let change =
      BigInt(compiledAmount.quantity) - BigInt(compiledOutput.quantity);

    if (change) {
      utxoSelection.change.push({
        unit: compiledOutput.unit,
        quantity: change.toString(),
      });
    }

    // Return subset in remaining
    utxoSelection.remaining = [
      ...utxoSelection.remaining,
      ...utxoSelection.subset,
    ];
    utxoSelection.subset = [];

    return;
  }

  /** @type {UTxO} utxo */
  const utxo = utxoSelection.subset
    .splice(Math.floor(Math.random() * nbFreeUTxO), 1)
    .pop();

  const newAmount =
    BigInt(
      utxo.amount.find((amount) => amount.unit === compiledOutput.unit).quantity
    ) + BigInt(compiledAmount.quantity);

  if (
    abs(BigInt(range.ideal) - newAmount) <
      abs(BigInt(range.ideal) - BigInt(compiledAmount.quantity)) &&
    newAmount <= range.maximum
  ) {
    utxoSelection.selection.push(utxo);
    addAmounts(utxo.amount, utxoSelection.amount);
    limit--;
  } else {
    utxoSelection.remaining.push(utxo);
  }

  return improve(utxoSelection, compiledOutput, limit, range);
}

/**
 * Compile all required output to a flat amount list
 * @param {OutputList} outputList - The set of outputs requested for payment.
 * @return {AmountList} - The compiled set of amounts requested for payment.
 */
function compileOutputs(outputList) {
  let compiledAmountList = [];

  outputList.forEach((output) => addAmounts(output.amount, compiledAmountList));

  return compiledAmountList;
}

/**
 * Add up an AmountList values to an other AmountList
 * @param {AmountList} amountList - Set of amounts to be added.
 * @param {AmountList} compiledAmountList - The compiled set of amounts.
 */
function addAmounts(amountList, compiledAmountList) {
  amountList.forEach((amount) => {
    let entry = compiledAmountList.find(
      (compiledAmount) => compiledAmount.unit === amount.unit
    );

    // 'Add to' or 'insert' in compiledOutputList
    const am = JSON.parse(JSON.stringify(amount)); // Deep Copy
    entry
      ? (entry.quantity = (
          BigInt(entry.quantity) + BigInt(amount.quantity)
        ).toString())
      : compiledAmountList.push(am);
  });
}

/**
 * Sort an AmountList by AmountList[].quantity ASC/DESC
 * @param {AmountList} amountList - Set of amounts to be sorted.
 * @param {string} [sortOrder=ASC] - Order
 * @return {AmountList} - The sorted AmountList
 */
function sortAmountList(amountList, sortOrder = 'ASC') {
  return amountList.sort((a, b) =>
    Number(
      (BigInt(a.quantity) - BigInt(b.quantity)) *
        BigInt(sortOrder === 'DESC' ? -1 : 1)
    )
  );
}

/**
 * Narrow down remaining UTxO set in case of native token, use full set for lovelace
 * @param {UTxOSelection} utxoSelection - The set of selected/available inputs.
 * @param {Amount} compiledOutput - Single compiled output qty requested for payment.
 */
function createSubSet(utxoSelection, compiledOutput) {
  if (compiledOutput.unit !== 'lovelace') {
    utxoSelection.remaining.forEach((utxo, index) => {
      if (utxo.amount.some((amount) => amount.unit === compiledOutput.unit)) {
        utxoSelection.subset.push(
          utxoSelection.remaining.splice(index, 1).pop()
        );
      }
    });
  } else {
    utxoSelection.subset = utxoSelection.remaining.splice(
      0,
      utxoSelection.remaining.length
    );
  }
}

/**
 * Push extra UTxO assets in change
 * @param {UTxOSelection} utxoSelection - The set of selected/available inputs.
 * @param {AmountList} compiledOutputList - Compiled output list requested for payment.
 */
function addChangeExtra(utxoSelection, compiledOutputList) {
  utxoSelection.amount.forEach((amount) => {
    if (
      !compiledOutputList.some(
        (compiledAmount) => compiledAmount.unit === amount.unit
      )
    ) {
      utxoSelection.change.push(amount);
    }
  });
}

/**
 * Is Quantity Fulfilled Condition - Handle 'minUTxOValue' protocol parameter.
 * @param {Amount} compiledOutput - Single compiled output qty requested for payment.
 * @param {Amount} compiledAmount - Single compiled accumulated UTxO qty.
 * @param {int} minUTxOValue - Network protocol 'minUTxOValue' current value
 * @return {boolean}
 */
function isQtyFulfilled(compiledOutput, compiledAmount, minUTxOValue) {
  return compiledOutput.unit === 'lovelace'
    ? BigInt(compiledAmount.quantity) === BigInt(compiledOutput.quantity) ||
        BigInt(compiledAmount.quantity) >
          BigInt(compiledOutput.quantity) + BigInt(minUTxOValue)
    : BigInt(compiledAmount.quantity) >= BigInt(compiledOutput.quantity);
}

// Helper
function abs(big) {
  return big < 0 ? big * BigInt(-1) : big;
}
