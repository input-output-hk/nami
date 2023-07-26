use std::io::SeekFrom;

use super::*;

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct VotingProcedure {
    governance_action_id: GovernanceActionId,
    voter: Voter,
    vote: Vote,
    anchor: Anchor,
}

to_from_bytes!(VotingProcedure);

to_from_json!(VotingProcedure);

#[wasm_bindgen]
impl VotingProcedure {
    pub fn governance_action_id(&self) -> GovernanceActionId {
        self.governance_action_id.clone()
    }

    pub fn voter(&self) -> Voter {
        self.voter.clone()
    }

    pub fn vote(&self) -> VoteKind {
        self.vote.0.clone()
    }

    pub fn anchor(&self) -> Anchor {
        self.anchor.clone()
    }

    pub fn new(
        governance_action_id: &GovernanceActionId,
        voter: &Voter,
        vote: &Vote,
        anchor: &Anchor,
    ) -> Self {
        Self {
            governance_action_id: governance_action_id.clone(),
            voter: voter.clone(),
            vote: vote.clone(),
            anchor: anchor.clone(),
        }
    }
}

impl cbor_event::se::Serialize for VotingProcedure {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(4))?;
        self.governance_action_id.serialize(serializer)?;
        self.voter.serialize(serializer)?;
        self.vote.serialize(serializer)?;
        self.anchor.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for VotingProcedure {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let ret = Self::deserialize_as_embedded_group(raw, len);
            match len {
                cbor_event::Len::Len(_) =>
                /* TODO: check finite len somewhere */
                {
                    ()
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("VotingProcedure"))
    }
}

impl DeserializeEmbeddedGroup for VotingProcedure {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        let governance_action_id =
            (|| -> Result<_, DeserializeError> { Ok(GovernanceActionId::deserialize(raw)?) })()
                .map_err(|e| e.annotate("GovernanceActionId"))?;
        let voter = (|| -> Result<_, DeserializeError> { Ok(Voter::deserialize(raw)?) })()
            .map_err(|e| e.annotate("Voter"))?;
        let vote = (|| -> Result<_, DeserializeError> { Ok(Vote::deserialize(raw)?) })()
            .map_err(|e| e.annotate("Vote"))?;
        let anchor = (|| -> Result<_, DeserializeError> { Ok(Anchor::deserialize(raw)?) })()
            .map_err(|e| e.annotate("anchor"))?;
        Ok(VotingProcedure {
            governance_action_id,
            voter,
            vote,
            anchor,
        })
    }
}

// -----

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct VotingProcedures(pub(crate) Vec<VotingProcedure>);

to_from_bytes!(VotingProcedures);

#[wasm_bindgen]
impl VotingProcedures {
    pub fn new() -> Self {
        Self(Vec::new())
    }

    pub fn len(&self) -> usize {
        self.0.len()
    }

    pub fn get(&self, index: usize) -> VotingProcedure {
        self.0[index].clone()
    }

    pub fn add(&mut self, elem: &VotingProcedure) {
        self.0.push(elem.clone());
    }
}

impl cbor_event::se::Serialize for VotingProcedures {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(self.0.len() as u64))?;
        for element in &self.0 {
            element.serialize(serializer)?;
        }
        Ok(serializer)
    }
}

impl Deserialize for VotingProcedures {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        let mut arr = Vec::new();
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            while match len {
                cbor_event::Len::Len(n) => arr.len() < n as usize,
                cbor_event::Len::Indefinite => true,
            } {
                if raw.cbor_type()? == CBORType::Special {
                    assert_eq!(raw.special()?, CBORSpecial::Break);
                    break;
                }
                arr.push(VotingProcedure::deserialize(raw)?);
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("VotingProcedures"))?;
        Ok(Self(arr))
    }
}

// -----

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct ProposalProcedure {
    deposit: Coin,
    hash: ScriptHash,
    governance_action: GovernanceAction,
    anchor: Anchor,
}

to_from_bytes!(ProposalProcedure);

to_from_json!(ProposalProcedure);

#[wasm_bindgen]
impl ProposalProcedure {
    pub fn deposit(&self) -> Coin {
        self.deposit.clone()
    }

    pub fn hash(&self) -> ScriptHash {
        self.hash.clone()
    }

    pub fn governance_action(&self) -> GovernanceAction {
        self.governance_action.clone()
    }

    pub fn anchor(&self) -> Anchor {
        self.anchor.clone()
    }

    pub fn new(
        deposit: &Coin,
        hash: &ScriptHash,
        governance_action: &GovernanceAction,
        anchor: &Anchor,
    ) -> Self {
        Self {
            deposit: deposit.clone(),
            hash: hash.clone(),
            governance_action: governance_action.clone(),
            anchor: anchor.clone(),
        }
    }
}

impl cbor_event::se::Serialize for ProposalProcedure {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(4))?;
        self.deposit.serialize(serializer)?;
        self.hash.serialize(serializer)?;
        self.governance_action.serialize(serializer)?;
        self.anchor.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for ProposalProcedure {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let ret = Self::deserialize_as_embedded_group(raw, len);
            match len {
                cbor_event::Len::Len(_) =>
                /* TODO: check finite len somewhere */
                {
                    ()
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("ProposalProcedure"))
    }
}

impl DeserializeEmbeddedGroup for ProposalProcedure {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        let deposit = (|| -> Result<_, DeserializeError> { Ok(Coin::deserialize(raw)?) })()
            .map_err(|e| e.annotate("deposit"))?;
        let hash = (|| -> Result<_, DeserializeError> { Ok(ScriptHash::deserialize(raw)?) })()
            .map_err(|e| e.annotate("hash"))?;
        let governance_action =
            (|| -> Result<_, DeserializeError> { Ok(GovernanceAction::deserialize(raw)?) })()
                .map_err(|e| e.annotate("governance_action"))?;
        let anchor = (|| -> Result<_, DeserializeError> { Ok(Anchor::deserialize(raw)?) })()
            .map_err(|e| e.annotate("anchor"))?;
        Ok(ProposalProcedure {
            deposit,
            hash,
            governance_action,
            anchor,
        })
    }
}

// ----

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct ProposalProcedures(pub(crate) Vec<ProposalProcedure>);

to_from_bytes!(ProposalProcedures);

#[wasm_bindgen]
impl ProposalProcedures {
    pub fn new() -> Self {
        Self(Vec::new())
    }

    pub fn len(&self) -> usize {
        self.0.len()
    }

    pub fn get(&self, index: usize) -> ProposalProcedure {
        self.0[index].clone()
    }

    pub fn add(&mut self, elem: &ProposalProcedure) {
        self.0.push(elem.clone());
    }
}

impl cbor_event::se::Serialize for ProposalProcedures {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(self.0.len() as u64))?;
        for element in &self.0 {
            element.serialize(serializer)?;
        }
        Ok(serializer)
    }
}

impl Deserialize for ProposalProcedures {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        let mut arr = Vec::new();
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            while match len {
                cbor_event::Len::Len(n) => arr.len() < n as usize,
                cbor_event::Len::Indefinite => true,
            } {
                if raw.cbor_type()? == CBORType::Special {
                    assert_eq!(raw.special()?, CBORSpecial::Break);
                    break;
                }
                arr.push(ProposalProcedure::deserialize(raw)?);
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("ProposalProcedures"))?;
        Ok(Self(arr))
    }
}

// ----

#[wasm_bindgen]
#[derive(Clone, Debug, Eq, Ord, PartialEq, PartialOrd)]
pub enum GovernanceActionKind {
    ParameterChangeAction,
    HardForkInitiationAction,
    TreasuryWithdrawalsAction,
    NoConfidence,
    NewCommittee,
    NewConstitution,
    InfoAction,
}

#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub enum GovernanceActionEnum {
    ParameterChangeAction(ParameterChangeAction),
    HardForkInitiationAction(HardForkInitiationAction),
    TreasuryWithdrawalsAction(TreasuryWithdrawalsAction),
    NoConfidence,
    NewCommittee(NewCommittee),
    NewConstitution(NewConstitution),
    InfoAction,
}

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct GovernanceAction(GovernanceActionEnum);

to_from_bytes!(GovernanceAction);

to_from_json!(GovernanceAction);

#[wasm_bindgen]
impl GovernanceAction {
    pub fn new_parameter_change_action(parameter_change_action: &ParameterChangeAction) -> Self {
        Self(GovernanceActionEnum::ParameterChangeAction(
            parameter_change_action.clone(),
        ))
    }

    pub fn new_hard_fork_initiation_action(
        hard_fork_initiation_action: &HardForkInitiationAction,
    ) -> Self {
        Self(GovernanceActionEnum::HardForkInitiationAction(
            hard_fork_initiation_action.clone(),
        ))
    }

    pub fn new_treasury_withdrawals_action(
        treasury_withdrawals_action: &TreasuryWithdrawalsAction,
    ) -> Self {
        Self(GovernanceActionEnum::TreasuryWithdrawalsAction(
            treasury_withdrawals_action.clone(),
        ))
    }

    pub fn new_no_confidence() -> Self {
        Self(GovernanceActionEnum::NoConfidence)
    }

    pub fn new_new_committee(new_committe: &NewCommittee) -> Self {
        Self(GovernanceActionEnum::NewCommittee(new_committe.clone()))
    }

    pub fn new_new_constitution(new_constitution: &NewConstitution) -> Self {
        Self(GovernanceActionEnum::NewConstitution(
            new_constitution.clone(),
        ))
    }

    pub fn new_info_action() -> Self {
        Self(GovernanceActionEnum::InfoAction)
    }

    pub fn kind(&self) -> GovernanceActionKind {
        match &self.0 {
            GovernanceActionEnum::ParameterChangeAction(_) => {
                GovernanceActionKind::ParameterChangeAction
            }
            GovernanceActionEnum::HardForkInitiationAction(_) => {
                GovernanceActionKind::HardForkInitiationAction
            }
            GovernanceActionEnum::TreasuryWithdrawalsAction(_) => {
                GovernanceActionKind::TreasuryWithdrawalsAction
            }
            GovernanceActionEnum::NoConfidence => GovernanceActionKind::NoConfidence,
            GovernanceActionEnum::NewCommittee(_) => GovernanceActionKind::NewCommittee,
            GovernanceActionEnum::NewConstitution(_) => GovernanceActionKind::NewConstitution,
            GovernanceActionEnum::InfoAction => GovernanceActionKind::InfoAction,
        }
    }

    pub fn as_parameter_change_action(&self) -> Option<ParameterChangeAction> {
        match &self.0 {
            GovernanceActionEnum::ParameterChangeAction(x) => Some(x.clone()),
            _ => None,
        }
    }

    pub fn as_hard_fork_initiation_action(&self) -> Option<HardForkInitiationAction> {
        match &self.0 {
            GovernanceActionEnum::HardForkInitiationAction(x) => Some(x.clone()),
            _ => None,
        }
    }

    pub fn as_treasury_withdrawals_action(&self) -> Option<TreasuryWithdrawalsAction> {
        match &self.0 {
            GovernanceActionEnum::TreasuryWithdrawalsAction(x) => Some(x.clone()),
            _ => None,
        }
    }

    pub fn as_new_committee(&self) -> Option<NewCommittee> {
        match &self.0 {
            GovernanceActionEnum::NewCommittee(x) => Some(x.clone()),
            _ => None,
        }
    }

    pub fn as_new_constitution(&self) -> Option<NewConstitution> {
        match &self.0 {
            GovernanceActionEnum::NewConstitution(x) => Some(x.clone()),
            _ => None,
        }
    }
}

impl cbor_event::se::Serialize for GovernanceActionEnum {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        match self {
            GovernanceActionEnum::ParameterChangeAction(x) => x.serialize(serializer),
            GovernanceActionEnum::HardForkInitiationAction(x) => x.serialize(serializer),
            GovernanceActionEnum::TreasuryWithdrawalsAction(x) => x.serialize(serializer),
            GovernanceActionEnum::NoConfidence => serializer.write_unsigned_integer(3u64),
            GovernanceActionEnum::NewCommittee(x) => x.serialize(serializer),
            GovernanceActionEnum::NewConstitution(x) => x.serialize(serializer),
            GovernanceActionEnum::InfoAction => serializer.write_unsigned_integer(6u64),
        }
    }
}

impl Deserialize for GovernanceActionEnum {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let ret = Self::deserialize_as_embedded_group(raw, len);
            match len {
                cbor_event::Len::Len(_) =>
                /* TODO: check finite len somewhere */
                {
                    ()
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("GovernanceActionEnum"))
    }
}

impl DeserializeEmbeddedGroup for GovernanceActionEnum {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        len: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        let initial_position = raw.as_mut_ref().seek(SeekFrom::Current(0)).unwrap();
        match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
            Ok(ParameterChangeAction::deserialize_as_embedded_group(
                raw, len,
            )?)
        })(raw)
        {
            Ok(variant) => return Ok(GovernanceActionEnum::ParameterChangeAction(variant)),
            Err(_) => raw
                .as_mut_ref()
                .seek(SeekFrom::Start(initial_position))
                .unwrap(),
        };
        match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
            Ok(HardForkInitiationAction::deserialize_as_embedded_group(
                raw, len,
            )?)
        })(raw)
        {
            Ok(variant) => return Ok(GovernanceActionEnum::HardForkInitiationAction(variant)),
            Err(_) => raw
                .as_mut_ref()
                .seek(SeekFrom::Start(initial_position))
                .unwrap(),
        };
        match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
            Ok(TreasuryWithdrawalsAction::deserialize_as_embedded_group(
                raw, len,
            )?)
        })(raw)
        {
            Ok(variant) => return Ok(GovernanceActionEnum::TreasuryWithdrawalsAction(variant)),
            Err(_) => raw
                .as_mut_ref()
                .seek(SeekFrom::Start(initial_position))
                .unwrap(),
        };
        match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
            Ok((|| -> Result<_, DeserializeError> {
                // NoConfidence
                let index_0_value = raw.unsigned_integer()?;
                if index_0_value != 3 {
                    return Err(DeserializeFailure::FixedValueMismatch {
                        found: Key::Uint(index_0_value),
                        expected: Key::Uint(3),
                    }
                    .into());
                }
                Ok(())
            })()
            .map_err(|e| e.annotate("index_3"))?)
        })(raw)
        {
            Ok(_) => return Ok(GovernanceActionEnum::NoConfidence),
            Err(_) => raw
                .as_mut_ref()
                .seek(SeekFrom::Start(initial_position))
                .unwrap(),
        };
        match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
            Ok(NewCommittee::deserialize_as_embedded_group(raw, len)?)
        })(raw)
        {
            Ok(variant) => return Ok(GovernanceActionEnum::NewCommittee(variant)),
            Err(_) => raw
                .as_mut_ref()
                .seek(SeekFrom::Start(initial_position))
                .unwrap(),
        };
        match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
            Ok(NewConstitution::deserialize_as_embedded_group(raw, len)?)
        })(raw)
        {
            Ok(variant) => return Ok(GovernanceActionEnum::NewConstitution(variant)),
            Err(_) => raw
                .as_mut_ref()
                .seek(SeekFrom::Start(initial_position))
                .unwrap(),
        };
        match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
            // InfoAction
            Ok((|| -> Result<_, DeserializeError> {
                let index_0_value = raw.unsigned_integer()?;
                if index_0_value != 6 {
                    return Err(DeserializeFailure::FixedValueMismatch {
                        found: Key::Uint(index_0_value),
                        expected: Key::Uint(6),
                    }
                    .into());
                }
                Ok(())
            })()
            .map_err(|e| e.annotate("index_6"))?)
        })(raw)
        {
            Ok(_) => return Ok(GovernanceActionEnum::InfoAction),
            Err(_) => raw
                .as_mut_ref()
                .seek(SeekFrom::Start(initial_position))
                .unwrap(),
        };
        Err(DeserializeError::new(
            "GovernanceActionEnum",
            DeserializeFailure::NoVariantMatched.into(),
        ))
    }
}

impl cbor_event::se::Serialize for GovernanceAction {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        self.0.serialize(serializer)
    }
}

impl Deserialize for GovernanceAction {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        Ok(Self(GovernanceActionEnum::deserialize(raw)?))
    }
}

// ----

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct ParameterChangeAction {
    protocol_param_update: ProtocolParamUpdate,
}

to_from_bytes!(ParameterChangeAction);

to_from_json!(ParameterChangeAction);

#[wasm_bindgen]
impl ParameterChangeAction {
    pub fn protocol_param_update(&self) -> ProtocolParamUpdate {
        self.protocol_param_update.clone()
    }

    pub fn new(protocol_param_update: &ProtocolParamUpdate) -> Self {
        Self {
            protocol_param_update: protocol_param_update.clone(),
        }
    }
}

impl cbor_event::se::Serialize for ParameterChangeAction {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(2))?;
        self.serialize_as_embedded_group(serializer)
    }
}

impl SerializeEmbeddedGroup for ParameterChangeAction {
    fn serialize_as_embedded_group<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_unsigned_integer(0u64)?;
        self.protocol_param_update.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for ParameterChangeAction {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let ret = Self::deserialize_as_embedded_group(raw, len);
            match len {
                cbor_event::Len::Len(_) =>
                /* TODO: check finite len somewhere */
                {
                    ()
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("ParameterChangeAction"))
    }
}

impl DeserializeEmbeddedGroup for ParameterChangeAction {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let index_0_value = raw.unsigned_integer()?;
            if index_0_value != 0 {
                return Err(DeserializeFailure::FixedValueMismatch {
                    found: Key::Uint(index_0_value),
                    expected: Key::Uint(0),
                }
                .into());
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("index_0"))?;
        let protocol_param_update =
            (|| -> Result<_, DeserializeError> { Ok(ProtocolParamUpdate::deserialize(raw)?) })()
                .map_err(|e| e.annotate("protocol_param_update"))?;
        Ok(ParameterChangeAction {
            protocol_param_update,
        })
    }
}

// ----

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct HardForkInitiationAction {
    protocol_version: ProtocolVersion,
}

to_from_bytes!(HardForkInitiationAction);

to_from_json!(HardForkInitiationAction);

#[wasm_bindgen]
impl HardForkInitiationAction {
    pub fn protocol_version(&self) -> ProtocolVersion {
        self.protocol_version.clone()
    }

    pub fn new(protocol_version: &ProtocolVersion) -> Self {
        Self {
            protocol_version: protocol_version.clone(),
        }
    }
}

impl cbor_event::se::Serialize for HardForkInitiationAction {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(2))?;
        self.serialize_as_embedded_group(serializer)
    }
}

impl SerializeEmbeddedGroup for HardForkInitiationAction {
    fn serialize_as_embedded_group<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_unsigned_integer(1u64)?;
        serializer.write_array(cbor_event::Len::Len(1))?;
        self.protocol_version.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for HardForkInitiationAction {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let ret = Self::deserialize_as_embedded_group(raw, len);
            match len {
                cbor_event::Len::Len(_) =>
                /* TODO: check finite len somewhere */
                {
                    ()
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("HardForkInitiationAction"))
    }
}

impl DeserializeEmbeddedGroup for HardForkInitiationAction {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let index_1_value = raw.unsigned_integer()?;
            if index_1_value != 1 {
                return Err(DeserializeFailure::FixedValueMismatch {
                    found: Key::Uint(index_1_value),
                    expected: Key::Uint(1),
                }
                .into());
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("index_1"))?;
        let protocol_version = (|| -> Result<_, DeserializeError> {
            raw.array()?;
            Ok(ProtocolVersion::deserialize(raw)?)
        })()
        .map_err(|e| e.annotate("protocol_version"))?;
        Ok(HardForkInitiationAction { protocol_version })
    }
}

// ----

#[wasm_bindgen]
#[derive(Clone, Debug, Eq, Ord, PartialEq, PartialOrd)]
pub struct TreasuryWithdrawals(std::collections::BTreeMap<Ed25519KeyHash, Coin>);

to_from_bytes!(TreasuryWithdrawals);

to_from_json!(TreasuryWithdrawals);

#[wasm_bindgen]
impl TreasuryWithdrawals {
    pub fn new() -> Self {
        Self(std::collections::BTreeMap::new())
    }

    pub fn len(&self) -> usize {
        self.0.len()
    }

    pub fn insert(&mut self, key: &Ed25519KeyHash, value: &Coin) -> Option<Coin> {
        self.0.insert(key.clone(), value.clone())
    }

    pub fn get(&self, key: &Ed25519KeyHash) -> Option<Coin> {
        self.0.get(key).map(|v| v.clone())
    }

    pub fn keys(&self) -> Ed25519KeyHashes {
        Ed25519KeyHashes(
            self.0
                .iter()
                .map(|(k, _v)| k.clone())
                .collect::<Vec<Ed25519KeyHash>>(),
        )
    }
}

impl cbor_event::se::Serialize for TreasuryWithdrawals {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_map(cbor_event::Len::Len(self.0.len() as u64))?;
        for (key, value) in &self.0 {
            key.serialize(serializer)?;
            value.serialize(serializer)?;
        }
        Ok(serializer)
    }
}

impl Deserialize for TreasuryWithdrawals {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        let mut table = std::collections::BTreeMap::new();
        (|| -> Result<_, DeserializeError> {
            let len = raw.map()?;
            while match len {
                cbor_event::Len::Len(n) => table.len() < n as usize,
                cbor_event::Len::Indefinite => true,
            } {
                if raw.cbor_type()? == CBORType::Special {
                    assert_eq!(raw.special()?, CBORSpecial::Break);
                    break;
                }
                let key = Ed25519KeyHash::deserialize(raw)?;
                let value = Coin::deserialize(raw)?;
                if table.insert(key.clone(), value).is_some() {
                    return Err(DeserializeFailure::DuplicateKey(Key::Str(String::from(
                        "some complicated/unsupported type",
                    )))
                    .into());
                }
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("TreasuryWithdrawals"))?;
        Ok(Self(table))
    }
}

impl serde::Serialize for TreasuryWithdrawals {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let map = self.0.iter().collect::<std::collections::BTreeMap<_, _>>();
        map.serialize(serializer)
    }
}

impl<'de> serde::de::Deserialize<'de> for TreasuryWithdrawals {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::de::Deserializer<'de>,
    {
        let map = <std::collections::BTreeMap<_, _> as serde::de::Deserialize>::deserialize(
            deserializer,
        )?;
        Ok(Self(map.into_iter().collect()))
    }
}

impl JsonSchema for TreasuryWithdrawals {
    fn schema_name() -> String {
        String::from("TreasuryWithdrawals")
    }
    fn json_schema(gen: &mut schemars::gen::SchemaGenerator) -> schemars::schema::Schema {
        std::collections::BTreeMap::<GenesisHash, ProtocolParamUpdate>::json_schema(gen)
    }
    fn is_referenceable() -> bool {
        std::collections::BTreeMap::<GenesisHash, ProtocolParamUpdate>::is_referenceable()
    }
}

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct TreasuryWithdrawalsAction {
    withdrawals: TreasuryWithdrawals,
}

to_from_bytes!(TreasuryWithdrawalsAction);

to_from_json!(TreasuryWithdrawalsAction);

#[wasm_bindgen]
impl TreasuryWithdrawalsAction {
    pub fn withdrawals(&self) -> TreasuryWithdrawals {
        self.withdrawals.clone()
    }

    pub fn new(withdrawals: &TreasuryWithdrawals) -> Self {
        Self {
            withdrawals: withdrawals.clone(),
        }
    }
}

impl cbor_event::se::Serialize for TreasuryWithdrawalsAction {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(2))?;
        self.serialize_as_embedded_group(serializer)
    }
}

impl SerializeEmbeddedGroup for TreasuryWithdrawalsAction {
    fn serialize_as_embedded_group<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_unsigned_integer(2u64)?;
        self.withdrawals.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for TreasuryWithdrawalsAction {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let ret = Self::deserialize_as_embedded_group(raw, len);
            match len {
                cbor_event::Len::Len(_) =>
                /* TODO: check finite len somewhere */
                {
                    ()
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("TreasuryWithdrawalsAction"))
    }
}

impl DeserializeEmbeddedGroup for TreasuryWithdrawalsAction {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let index_2_value = raw.unsigned_integer()?;
            if index_2_value != 2 {
                return Err(DeserializeFailure::FixedValueMismatch {
                    found: Key::Uint(index_2_value),
                    expected: Key::Uint(2),
                }
                .into());
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("index_2"))?;
        let withdrawals =
            (|| -> Result<_, DeserializeError> { Ok(TreasuryWithdrawals::deserialize(raw)?) })()
                .map_err(|e| e.annotate("protocol_param_update"))?;
        Ok(TreasuryWithdrawalsAction { withdrawals })
    }
}

// ----

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct NewCommittee {
    committee: Ed25519KeyHashes,
    rational: Rational,
}

to_from_bytes!(NewCommittee);

to_from_json!(NewCommittee);

#[wasm_bindgen]
impl NewCommittee {
    pub fn committee(&self) -> Ed25519KeyHashes {
        self.committee.clone()
    }

    pub fn rational(&self) -> Rational {
        self.rational.clone()
    }

    pub fn new(committee: &Ed25519KeyHashes, rational: &Rational) -> Self {
        Self {
            committee: committee.clone(),
            rational: rational.clone(),
        }
    }
}

impl cbor_event::se::Serialize for NewCommittee {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(3))?;
        self.serialize_as_embedded_group(serializer)
    }
}

impl SerializeEmbeddedGroup for NewCommittee {
    fn serialize_as_embedded_group<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_unsigned_integer(4u64)?;
        self.committee.serialize(serializer)?;
        self.rational.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for NewCommittee {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let ret = Self::deserialize_as_embedded_group(raw, len);
            match len {
                cbor_event::Len::Len(_) =>
                /* TODO: check finite len somewhere */
                {
                    ()
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("NewCommittee"))
    }
}

impl DeserializeEmbeddedGroup for NewCommittee {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let index_4_value = raw.unsigned_integer()?;
            if index_4_value != 4 {
                return Err(DeserializeFailure::FixedValueMismatch {
                    found: Key::Uint(index_4_value),
                    expected: Key::Uint(4),
                }
                .into());
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("index_4"))?;
        let committee =
            (|| -> Result<_, DeserializeError> { Ok(Ed25519KeyHashes::deserialize(raw)?) })()
                .map_err(|e| e.annotate("committee"))?;
        let rational = (|| -> Result<_, DeserializeError> { Ok(Rational::deserialize(raw)?) })()
            .map_err(|e| e.annotate("rational"))?;
        Ok(NewCommittee {
            committee,
            rational,
        })
    }
}

// ----

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct NewConstitution {
    hash: DataHash,
}

to_from_bytes!(NewConstitution);

to_from_json!(NewConstitution);

#[wasm_bindgen]
impl NewConstitution {
    pub fn hash(&self) -> DataHash {
        self.hash.clone()
    }

    pub fn new(hash: &DataHash) -> Self {
        Self { hash: hash.clone() }
    }
}

impl cbor_event::se::Serialize for NewConstitution {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(2))?;
        self.serialize_as_embedded_group(serializer)
    }
}

impl SerializeEmbeddedGroup for NewConstitution {
    fn serialize_as_embedded_group<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_unsigned_integer(5u64)?;
        self.hash.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for NewConstitution {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let ret = Self::deserialize_as_embedded_group(raw, len);
            match len {
                cbor_event::Len::Len(_) =>
                /* TODO: check finite len somewhere */
                {
                    ()
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("NewConstitution"))
    }
}

impl DeserializeEmbeddedGroup for NewConstitution {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let index_0_value = raw.unsigned_integer()?;
            if index_0_value != 0 {
                return Err(DeserializeFailure::FixedValueMismatch {
                    found: Key::Uint(index_0_value),
                    expected: Key::Uint(0),
                }
                .into());
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("index_0"))?;
        let hash = (|| -> Result<_, DeserializeError> { Ok(DataHash::deserialize(raw)?) })()
            .map_err(|e| e.annotate("hash"))?;
        Ok(NewConstitution { hash })
    }
}

// ----

#[wasm_bindgen]
#[derive(Clone, Debug, Eq, Ord, PartialEq, PartialOrd)]
pub enum VoterKind {
    CommitteeHotKeyHash,
    CommitteeHotScriptHash,
    DrepKeyHash,
    DrepScriptHash,
    StakingPoolKeyHash,
}

#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub enum VoterEnum {
    CommitteeHotKeyHash(Ed25519KeyHash),
    CommitteeHotScriptHash(ScriptHash),
    DrepKeyHash(Ed25519KeyHash),
    DrepScriptHash(ScriptHash),
    StakingPoolKeyHash(Ed25519KeyHash),
}

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct Voter(VoterEnum);

to_from_bytes!(Voter);

to_from_json!(Voter);

#[wasm_bindgen]
impl Voter {
    pub fn new_committee_hot_keyhash(keyhash: &Ed25519KeyHash) -> Self {
        Self(VoterEnum::CommitteeHotKeyHash(keyhash.clone()))
    }

    pub fn new_committee_hot_scripthash(scripthash: &ScriptHash) -> Self {
        Self(VoterEnum::CommitteeHotScriptHash(scripthash.clone()))
    }

    pub fn new_drep_keyhash(keyhash: &Ed25519KeyHash) -> Self {
        Self(VoterEnum::DrepKeyHash(keyhash.clone()))
    }

    pub fn new_drep_scripthash(scripthash: &ScriptHash) -> Self {
        Self(VoterEnum::DrepScriptHash(scripthash.clone()))
    }

    pub fn new_staking_pool_keyhash(keyhash: &Ed25519KeyHash) -> Self {
        Self(VoterEnum::StakingPoolKeyHash(keyhash.clone()))
    }

    pub fn kind(&self) -> VoterKind {
        match &self.0 {
            VoterEnum::CommitteeHotKeyHash(_) => VoterKind::CommitteeHotKeyHash,
            VoterEnum::CommitteeHotScriptHash(_) => VoterKind::CommitteeHotScriptHash,
            VoterEnum::DrepKeyHash(_) => VoterKind::DrepKeyHash,
            VoterEnum::DrepScriptHash(_) => VoterKind::DrepScriptHash,
            VoterEnum::StakingPoolKeyHash(_) => VoterKind::StakingPoolKeyHash,
        }
    }

    pub fn as_committee_hot_keyhash(&self) -> Option<Ed25519KeyHash> {
        match &self.0 {
            VoterEnum::CommitteeHotKeyHash(x) => Some(x.clone()),
            _ => None,
        }
    }

    pub fn as_committee_hot_scripthash(&self) -> Option<ScriptHash> {
        match &self.0 {
            VoterEnum::CommitteeHotScriptHash(x) => Some(x.clone()),
            _ => None,
        }
    }

    pub fn as_drep_keyhash(&self) -> Option<Ed25519KeyHash> {
        match &self.0 {
            VoterEnum::DrepKeyHash(x) => Some(x.clone()),
            _ => None,
        }
    }

    pub fn as_drep_scripthash(&self) -> Option<ScriptHash> {
        match &self.0 {
            VoterEnum::DrepScriptHash(x) => Some(x.clone()),
            _ => None,
        }
    }

    pub fn as_staking_pool_keyhash(&self) -> Option<Ed25519KeyHash> {
        match &self.0 {
            VoterEnum::StakingPoolKeyHash(x) => Some(x.clone()),
            _ => None,
        }
    }
}

impl cbor_event::se::Serialize for Voter {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(2))?;
        match &self.0 {
            VoterEnum::CommitteeHotKeyHash(keyhash) => {
                serializer.write_unsigned_integer(0u64)?;
                serializer.write_bytes(keyhash.to_bytes())
            }
            VoterEnum::CommitteeHotScriptHash(scripthash) => {
                serializer.write_unsigned_integer(1u64)?;
                serializer.write_bytes(scripthash.to_bytes())
            }
            VoterEnum::DrepKeyHash(keyhash) => {
                serializer.write_unsigned_integer(2u64)?;
                serializer.write_bytes(keyhash.to_bytes())
            }
            VoterEnum::DrepScriptHash(scripthash) => {
                serializer.write_unsigned_integer(3u64)?;
                serializer.write_bytes(scripthash.to_bytes())
            }
            VoterEnum::StakingPoolKeyHash(keyhash) => {
                serializer.write_unsigned_integer(4u64)?;
                serializer.write_bytes(keyhash.to_bytes())
            }
        }
    }
}

impl Deserialize for Voter {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            if let cbor_event::Len::Len(n) = len {
                if n != 2 {
                    return Err(DeserializeFailure::CBOR(cbor_event::Error::WrongLen(
                        2,
                        len,
                        "[id, voter]",
                    ))
                    .into());
                }
            }
            let voter_type = match raw.unsigned_integer()? {
                0 => VoterEnum::CommitteeHotKeyHash(Ed25519KeyHash::deserialize(raw)?),
                1 => VoterEnum::CommitteeHotScriptHash(ScriptHash::deserialize(raw)?),
                2 => VoterEnum::DrepKeyHash(Ed25519KeyHash::deserialize(raw)?),
                3 => VoterEnum::DrepScriptHash(ScriptHash::deserialize(raw)?),
                4 => VoterEnum::StakingPoolKeyHash(Ed25519KeyHash::deserialize(raw)?),
                n => {
                    return Err(DeserializeFailure::FixedValueMismatch {
                        found: Key::Uint(n),
                        // TODO: change codegen to make FixedValueMismatch support Vec<Key> or ranges or something
                        expected: Key::Uint(0),
                    }
                    .into());
                }
            };
            if let cbor_event::Len::Indefinite = len {
                if raw.special()? != CBORSpecial::Break {
                    return Err(DeserializeFailure::EndingBreakMissing.into());
                }
            }
            Ok(Voter(voter_type))
        })()
        .map_err(|e| e.annotate("Voter"))
    }
}

// ----

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct Anchor {
    anchor_url: Url,
    anchor_data_hash: DataHash,
}

to_from_bytes!(Anchor);

to_from_json!(Anchor);

#[wasm_bindgen]
impl Anchor {
    pub fn anchor_url(&self) -> Url {
        self.anchor_url.clone()
    }

    pub fn anchor_data_hash(&self) -> DataHash {
        self.anchor_data_hash.clone()
    }

    pub fn new(anchor_url: &Url, anchor_data_hash: &DataHash) -> Self {
        Self {
            anchor_url: anchor_url.clone(),
            anchor_data_hash: anchor_data_hash.clone(),
        }
    }
}

impl cbor_event::se::Serialize for Anchor {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(2))?;
        self.anchor_url.serialize(serializer)?;
        self.anchor_data_hash.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for Anchor {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            if let cbor_event::Len::Len(n) = len {
                if n != 2 {
                    return Err(DeserializeFailure::CBOR(cbor_event::Error::WrongLen(
                        2,
                        len,
                        "[url, hash]",
                    ))
                    .into());
                }
            }
            let anchor_url = Url::deserialize(raw)?;
            let anchor_data_hash = DataHash::deserialize(raw)?;
            if let cbor_event::Len::Indefinite = len {
                if raw.special()? != CBORSpecial::Break {
                    return Err(DeserializeFailure::EndingBreakMissing.into());
                }
            }
            Ok(Anchor {
                anchor_url,
                anchor_data_hash,
            })
        })()
        .map_err(|e| e.annotate("Anchor"))
    }
}

// ----

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub enum VoteKind {
    No,
    Yes,
    Abstain,
}

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct Vote(VoteKind);

to_from_bytes!(Vote);

to_from_json!(Vote);

#[wasm_bindgen]
impl Vote {
    pub fn new_no() -> Self {
        Self(VoteKind::No)
    }

    pub fn new_yes() -> Self {
        Self(VoteKind::Yes)
    }

    pub fn new_abstain() -> Self {
        Self(VoteKind::Abstain)
    }

    pub fn kind(&self) -> VoteKind {
        self.0.clone()
    }
}

impl cbor_event::se::Serialize for Vote {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        match self.0 {
            VoteKind::No => serializer.write_unsigned_integer(0u64)?,
            VoteKind::Yes => serializer.write_unsigned_integer(1u64)?,
            VoteKind::Abstain => serializer.write_unsigned_integer(2u64)?,
        };
        Ok(serializer)
    }
}

impl Deserialize for Vote {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let vote_type = raw.unsigned_integer()?;

            let vote = match vote_type {
                0 => VoteKind::No,
                1 => VoteKind::Yes,
                2 => VoteKind::Abstain,
                n => {
                    return Err(DeserializeFailure::FixedValueMismatch {
                        found: Key::Uint(n),
                        // TODO: change codegen to make FixedValueMismatch support Vec<Key> or ranges or something
                        expected: Key::Uint(2),
                    }
                    .into());
                }
            };
            Ok(Vote(vote))
        })()
        .map_err(|e| e.annotate("Vote"))
    }
}

// ----

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct GovernanceActionId {
    transaction_id: TransactionHash,
    governance_action_index: BigNum,
}

to_from_bytes!(GovernanceActionId);

to_from_json!(GovernanceActionId);

#[wasm_bindgen]
impl GovernanceActionId {
    pub fn transaction_id(&self) -> TransactionHash {
        self.transaction_id.clone()
    }

    pub fn governance_action_index(&self) -> BigNum {
        self.governance_action_index.clone()
    }

    pub fn new(transaction_id: &TransactionHash, governance_action_index: &BigNum) -> Self {
        Self {
            transaction_id: transaction_id.clone(),
            governance_action_index: governance_action_index.clone(),
        }
    }
}

impl cbor_event::se::Serialize for GovernanceActionId {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(2))?;
        self.transaction_id.serialize(serializer)?;
        self.governance_action_index.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for GovernanceActionId {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            if let cbor_event::Len::Len(n) = len {
                if n != 2 {
                    return Err(DeserializeFailure::CBOR(cbor_event::Error::WrongLen(
                        2,
                        len,
                        "[txid, index]",
                    ))
                    .into());
                }
            }
            let transaction_id = TransactionHash::deserialize(raw)?;
            let governance_action_index = BigNum::deserialize(raw)?;
            if let cbor_event::Len::Indefinite = len {
                if raw.special()? != CBORSpecial::Break {
                    return Err(DeserializeFailure::EndingBreakMissing.into());
                }
            }
            Ok(GovernanceActionId {
                transaction_id,
                governance_action_index,
            })
        })()
        .map_err(|e| e.annotate("GovernanceActionId"))
    }
}

// ----

#[wasm_bindgen]
#[derive(Clone, Debug, Eq, Ord, PartialEq, PartialOrd)]
pub enum DrepKind {
    KeyHash,
    ScriptHash,
    Abstain,
    NoConfidence,
}

#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub enum DrepEnum {
    KeyHash(Ed25519KeyHash),
    ScriptHash(ScriptHash),
    Abstain,
    NoConfidence,
}

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct Drep(DrepEnum);

to_from_bytes!(Drep);

to_from_json!(Drep);

#[wasm_bindgen]
impl Drep {
    pub fn new_keyhash(keyhash: &Ed25519KeyHash) -> Self {
        Self(DrepEnum::KeyHash(keyhash.clone()))
    }

    pub fn new_scripthash(scripthash: &ScriptHash) -> Self {
        Self(DrepEnum::ScriptHash(scripthash.clone()))
    }

    pub fn new_abstain() -> Self {
        Self(DrepEnum::Abstain)
    }

    pub fn new_no_confidence() -> Self {
        Self(DrepEnum::NoConfidence)
    }

    pub fn kind(&self) -> DrepKind {
        match &self.0 {
            DrepEnum::KeyHash(_) => DrepKind::KeyHash,
            DrepEnum::ScriptHash(_) => DrepKind::ScriptHash,
            DrepEnum::Abstain => DrepKind::Abstain,
            DrepEnum::NoConfidence => DrepKind::NoConfidence,
        }
    }

    pub fn as_keyhash(&self) -> Option<Ed25519KeyHash> {
        match &self.0 {
            DrepEnum::KeyHash(x) => Some(x.clone()),
            _ => None,
        }
    }

    pub fn as_scripthash(&self) -> Option<ScriptHash> {
        match &self.0 {
            DrepEnum::ScriptHash(x) => Some(x.clone()),
            _ => None,
        }
    }
}

impl cbor_event::se::Serialize for Drep {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        match &self.0 {
            DrepEnum::KeyHash(keyhash) => {
                serializer.write_array(cbor_event::Len::Len(2))?;
                serializer.write_unsigned_integer(0u64)?;
                serializer.write_bytes(keyhash.to_bytes())
            }
            DrepEnum::ScriptHash(scripthash) => {
                serializer.write_array(cbor_event::Len::Len(2))?;
                serializer.write_unsigned_integer(1u64)?;
                serializer.write_bytes(scripthash.to_bytes())
            }
            DrepEnum::Abstain => {
                serializer.write_array(cbor_event::Len::Len(1))?;
                serializer.write_unsigned_integer(2u64)
            }
            DrepEnum::NoConfidence => {
                serializer.write_array(cbor_event::Len::Len(1))?;
                serializer.write_unsigned_integer(3u64)
            }
        }
    }
}

impl Deserialize for Drep {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            if let cbor_event::Len::Len(n) = len {
                if n != 1 && n != 2 {
                    return Err(DeserializeFailure::CBOR(cbor_event::Error::WrongLen(
                        2,
                        len,
                        "[id, drep?]",
                    ))
                    .into());
                }
            }
            let drep_type = match raw.unsigned_integer()? {
                0 => DrepEnum::KeyHash(Ed25519KeyHash::deserialize(raw)?),
                1 => DrepEnum::ScriptHash(ScriptHash::deserialize(raw)?),
                2 => DrepEnum::Abstain,
                3 => DrepEnum::NoConfidence,
                n => {
                    return Err(DeserializeFailure::FixedValueMismatch {
                        found: Key::Uint(n),
                        // TODO: change codegen to make FixedValueMismatch support Vec<Key> or ranges or something
                        expected: Key::Uint(3),
                    }
                    .into());
                }
            };
            if let cbor_event::Len::Indefinite = len {
                if raw.special()? != CBORSpecial::Break {
                    return Err(DeserializeFailure::EndingBreakMissing.into());
                }
            }
            Ok(Drep(drep_type))
        })()
        .map_err(|e| e.annotate("Drep"))
    }
}

// ----

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct RegCert {
    stake_credential: StakeCredential,
    coin: Coin,
}

to_from_bytes!(RegCert);

to_from_json!(RegCert);

#[wasm_bindgen]
impl RegCert {
    pub fn stake_credential(&self) -> StakeCredential {
        self.stake_credential.clone()
    }

    pub fn coin(&self) -> Coin {
        self.coin.clone()
    }

    pub fn new(stake_credential: &StakeCredential, coin: &Coin) -> Self {
        Self {
            stake_credential: stake_credential.clone(),
            coin: coin.clone(),
        }
    }
}

impl cbor_event::se::Serialize for RegCert {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(3))?;
        self.serialize_as_embedded_group(serializer)
    }
}

impl SerializeEmbeddedGroup for RegCert {
    fn serialize_as_embedded_group<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_unsigned_integer(7u64)?;
        self.stake_credential.serialize(serializer)?;
        self.coin.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for RegCert {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let ret = Self::deserialize_as_embedded_group(raw, len);
            match len {
                cbor_event::Len::Len(_) =>
                /* TODO: check finite len somewhere */
                {
                    ()
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("RegCert"))
    }
}

impl DeserializeEmbeddedGroup for RegCert {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let index_7_value = raw.unsigned_integer()?;
            if index_7_value != 7 {
                return Err(DeserializeFailure::FixedValueMismatch {
                    found: Key::Uint(index_7_value),
                    expected: Key::Uint(7),
                }
                .into());
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("index_7"))?;
        let stake_credential =
            (|| -> Result<_, DeserializeError> { Ok(StakeCredential::deserialize(raw)?) })()
                .map_err(|e| e.annotate("stake_credential"))?;
        let coin = (|| -> Result<_, DeserializeError> { Ok(Coin::deserialize(raw)?) })()
            .map_err(|e| e.annotate("coin"))?;
        Ok(RegCert {
            stake_credential,
            coin,
        })
    }
}

// ----

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct UnregCert {
    stake_credential: StakeCredential,
    coin: Coin,
}

to_from_bytes!(UnregCert);

to_from_json!(UnregCert);

#[wasm_bindgen]
impl UnregCert {
    pub fn stake_credential(&self) -> StakeCredential {
        self.stake_credential.clone()
    }

    pub fn coin(&self) -> Coin {
        self.coin.clone()
    }

    pub fn new(stake_credential: &StakeCredential, coin: &Coin) -> Self {
        Self {
            stake_credential: stake_credential.clone(),
            coin: coin.clone(),
        }
    }
}

impl cbor_event::se::Serialize for UnregCert {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(3))?;
        self.serialize_as_embedded_group(serializer)
    }
}

impl SerializeEmbeddedGroup for UnregCert {
    fn serialize_as_embedded_group<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_unsigned_integer(8u64)?;
        self.stake_credential.serialize(serializer)?;
        self.coin.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for UnregCert {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let ret = Self::deserialize_as_embedded_group(raw, len);
            match len {
                cbor_event::Len::Len(_) =>
                /* TODO: check finite len somewhere */
                {
                    ()
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("UnregCert"))
    }
}

impl DeserializeEmbeddedGroup for UnregCert {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let index_8_value = raw.unsigned_integer()?;
            if index_8_value != 8 {
                return Err(DeserializeFailure::FixedValueMismatch {
                    found: Key::Uint(index_8_value),
                    expected: Key::Uint(8),
                }
                .into());
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("index_8"))?;
        let stake_credential =
            (|| -> Result<_, DeserializeError> { Ok(StakeCredential::deserialize(raw)?) })()
                .map_err(|e| e.annotate("stake_credential"))?;
        let coin = (|| -> Result<_, DeserializeError> { Ok(Coin::deserialize(raw)?) })()
            .map_err(|e| e.annotate("coin"))?;
        Ok(UnregCert {
            stake_credential,
            coin,
        })
    }
}

// ----

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct VoteDelegCert {
    stake_credential: StakeCredential,
    drep: Drep,
}

to_from_bytes!(VoteDelegCert);

to_from_json!(VoteDelegCert);

#[wasm_bindgen]
impl VoteDelegCert {
    pub fn stake_credential(&self) -> StakeCredential {
        self.stake_credential.clone()
    }

    pub fn drep(&self) -> Drep {
        self.drep.clone()
    }

    pub fn new(stake_credential: &StakeCredential, drep: &Drep) -> Self {
        Self {
            stake_credential: stake_credential.clone(),
            drep: drep.clone(),
        }
    }
}

impl cbor_event::se::Serialize for VoteDelegCert {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(3))?;
        self.serialize_as_embedded_group(serializer)
    }
}

impl SerializeEmbeddedGroup for VoteDelegCert {
    fn serialize_as_embedded_group<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_unsigned_integer(9u64)?;
        self.stake_credential.serialize(serializer)?;
        self.drep.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for VoteDelegCert {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let ret = Self::deserialize_as_embedded_group(raw, len);
            match len {
                cbor_event::Len::Len(_) =>
                /* TODO: check finite len somewhere */
                {
                    ()
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("VoteDelegCert"))
    }
}

impl DeserializeEmbeddedGroup for VoteDelegCert {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let index_9_value = raw.unsigned_integer()?;
            if index_9_value != 9 {
                return Err(DeserializeFailure::FixedValueMismatch {
                    found: Key::Uint(index_9_value),
                    expected: Key::Uint(9),
                }
                .into());
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("index_9"))?;
        let stake_credential =
            (|| -> Result<_, DeserializeError> { Ok(StakeCredential::deserialize(raw)?) })()
                .map_err(|e| e.annotate("stake_credential"))?;
        let drep = (|| -> Result<_, DeserializeError> { Ok(Drep::deserialize(raw)?) })()
            .map_err(|e| e.annotate("drep"))?;
        Ok(VoteDelegCert {
            stake_credential,
            drep,
        })
    }
}

// ----

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct StakeVoteDelegCert {
    stake_credential: StakeCredential,
    pool_keyhash: Ed25519KeyHash,
    drep: Drep,
}

to_from_bytes!(StakeVoteDelegCert);

to_from_json!(StakeVoteDelegCert);

#[wasm_bindgen]
impl StakeVoteDelegCert {
    pub fn stake_credential(&self) -> StakeCredential {
        self.stake_credential.clone()
    }

    pub fn pool_keyhash(&self) -> Ed25519KeyHash {
        self.pool_keyhash.clone()
    }

    pub fn drep(&self) -> Drep {
        self.drep.clone()
    }

    pub fn new(
        stake_credential: &StakeCredential,
        pool_keyhash: &Ed25519KeyHash,
        drep: &Drep,
    ) -> Self {
        Self {
            stake_credential: stake_credential.clone(),
            pool_keyhash: pool_keyhash.clone(),
            drep: drep.clone(),
        }
    }
}

impl cbor_event::se::Serialize for StakeVoteDelegCert {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(4))?;
        self.serialize_as_embedded_group(serializer)
    }
}

impl SerializeEmbeddedGroup for StakeVoteDelegCert {
    fn serialize_as_embedded_group<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_unsigned_integer(10u64)?;
        self.stake_credential.serialize(serializer)?;
        self.pool_keyhash.serialize(serializer)?;
        self.drep.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for StakeVoteDelegCert {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let ret = Self::deserialize_as_embedded_group(raw, len);
            match len {
                cbor_event::Len::Len(_) =>
                /* TODO: check finite len somewhere */
                {
                    ()
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("StakeVoteDelegCert"))
    }
}

impl DeserializeEmbeddedGroup for StakeVoteDelegCert {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let index_10_value = raw.unsigned_integer()?;
            if index_10_value != 10 {
                return Err(DeserializeFailure::FixedValueMismatch {
                    found: Key::Uint(index_10_value),
                    expected: Key::Uint(10),
                }
                .into());
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("index_10"))?;
        let stake_credential =
            (|| -> Result<_, DeserializeError> { Ok(StakeCredential::deserialize(raw)?) })()
                .map_err(|e| e.annotate("stake_credential"))?;
        let pool_keyhash =
            (|| -> Result<_, DeserializeError> { Ok(Ed25519KeyHash::deserialize(raw)?) })()
                .map_err(|e| e.annotate("stake_credential"))?;
        let drep = (|| -> Result<_, DeserializeError> { Ok(Drep::deserialize(raw)?) })()
            .map_err(|e| e.annotate("drep"))?;
        Ok(StakeVoteDelegCert {
            stake_credential,
            pool_keyhash,
            drep,
        })
    }
}

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct StakeRegDelegCert {
    stake_credential: StakeCredential,
    pool_keyhash: Ed25519KeyHash,
    coin: Coin,
}

to_from_bytes!(StakeRegDelegCert);

to_from_json!(StakeRegDelegCert);

#[wasm_bindgen]
impl StakeRegDelegCert {
    pub fn stake_credential(&self) -> StakeCredential {
        self.stake_credential.clone()
    }

    pub fn pool_keyhash(&self) -> Ed25519KeyHash {
        self.pool_keyhash.clone()
    }

    pub fn coin(&self) -> Coin {
        self.coin.clone()
    }

    pub fn new(
        stake_credential: &StakeCredential,
        pool_keyhash: &Ed25519KeyHash,
        coin: &Coin,
    ) -> Self {
        Self {
            stake_credential: stake_credential.clone(),
            pool_keyhash: pool_keyhash.clone(),
            coin: coin.clone(),
        }
    }
}

impl cbor_event::se::Serialize for StakeRegDelegCert {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(4))?;
        self.serialize_as_embedded_group(serializer)
    }
}

impl SerializeEmbeddedGroup for StakeRegDelegCert {
    fn serialize_as_embedded_group<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_unsigned_integer(11u64)?;
        self.stake_credential.serialize(serializer)?;
        self.pool_keyhash.serialize(serializer)?;
        self.coin.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for StakeRegDelegCert {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let ret = Self::deserialize_as_embedded_group(raw, len);
            match len {
                cbor_event::Len::Len(_) =>
                /* TODO: check finite len somewhere */
                {
                    ()
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("StakeRegDelegCert"))
    }
}

impl DeserializeEmbeddedGroup for StakeRegDelegCert {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let index_11_value = raw.unsigned_integer()?;
            if index_11_value != 11 {
                return Err(DeserializeFailure::FixedValueMismatch {
                    found: Key::Uint(index_11_value),
                    expected: Key::Uint(11),
                }
                .into());
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("index_11"))?;
        let stake_credential =
            (|| -> Result<_, DeserializeError> { Ok(StakeCredential::deserialize(raw)?) })()
                .map_err(|e| e.annotate("stake_credential"))?;
        let pool_keyhash =
            (|| -> Result<_, DeserializeError> { Ok(Ed25519KeyHash::deserialize(raw)?) })()
                .map_err(|e| e.annotate("stake_credential"))?;
        let coin = (|| -> Result<_, DeserializeError> { Ok(Coin::deserialize(raw)?) })()
            .map_err(|e| e.annotate("coin"))?;
        Ok(StakeRegDelegCert {
            stake_credential,
            pool_keyhash,
            coin,
        })
    }
}

// ----

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct VoteRegDelegCert {
    stake_credential: StakeCredential,
    drep: Drep,
    coin: Coin,
}

to_from_bytes!(VoteRegDelegCert);

to_from_json!(VoteRegDelegCert);

#[wasm_bindgen]
impl VoteRegDelegCert {
    pub fn stake_credential(&self) -> StakeCredential {
        self.stake_credential.clone()
    }

    pub fn drep(&self) -> Drep {
        self.drep.clone()
    }

    pub fn coin(&self) -> Coin {
        self.coin.clone()
    }

    pub fn new(stake_credential: &StakeCredential, drep: &Drep, coin: &Coin) -> Self {
        Self {
            stake_credential: stake_credential.clone(),
            drep: drep.clone(),
            coin: coin.clone(),
        }
    }
}

impl cbor_event::se::Serialize for VoteRegDelegCert {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(4))?;
        self.serialize_as_embedded_group(serializer)
    }
}

impl SerializeEmbeddedGroup for VoteRegDelegCert {
    fn serialize_as_embedded_group<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_unsigned_integer(12u64)?;
        self.stake_credential.serialize(serializer)?;
        self.drep.serialize(serializer)?;
        self.coin.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for VoteRegDelegCert {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let ret = Self::deserialize_as_embedded_group(raw, len);
            match len {
                cbor_event::Len::Len(_) =>
                /* TODO: check finite len somewhere */
                {
                    ()
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("VoteRegDelegCert"))
    }
}

impl DeserializeEmbeddedGroup for VoteRegDelegCert {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let index_12_value = raw.unsigned_integer()?;
            if index_12_value != 12 {
                return Err(DeserializeFailure::FixedValueMismatch {
                    found: Key::Uint(index_12_value),
                    expected: Key::Uint(12),
                }
                .into());
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("index_12"))?;
        let stake_credential =
            (|| -> Result<_, DeserializeError> { Ok(StakeCredential::deserialize(raw)?) })()
                .map_err(|e| e.annotate("stake_credential"))?;
        let drep = (|| -> Result<_, DeserializeError> { Ok(Drep::deserialize(raw)?) })()
            .map_err(|e| e.annotate("drep"))?;
        let coin = (|| -> Result<_, DeserializeError> { Ok(Coin::deserialize(raw)?) })()
            .map_err(|e| e.annotate("coin"))?;
        Ok(VoteRegDelegCert {
            stake_credential,
            drep,
            coin,
        })
    }
}

// ----

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct StakeVoteRegDelegCert {
    stake_credential: StakeCredential,
    pool_keyhash: Ed25519KeyHash,
    drep: Drep,
    coin: Coin,
}

to_from_bytes!(StakeVoteRegDelegCert);

to_from_json!(StakeVoteRegDelegCert);

#[wasm_bindgen]
impl StakeVoteRegDelegCert {
    pub fn stake_credential(&self) -> StakeCredential {
        self.stake_credential.clone()
    }

    pub fn pool_keyhash(&self) -> Ed25519KeyHash {
        self.pool_keyhash.clone()
    }

    pub fn drep(&self) -> Drep {
        self.drep.clone()
    }

    pub fn coin(&self) -> Coin {
        self.coin.clone()
    }

    pub fn new(
        stake_credential: &StakeCredential,
        pool_keyhash: &Ed25519KeyHash,
        drep: &Drep,
        coin: &Coin,
    ) -> Self {
        Self {
            stake_credential: stake_credential.clone(),
            pool_keyhash: pool_keyhash.clone(),
            drep: drep.clone(),
            coin: coin.clone(),
        }
    }
}

impl cbor_event::se::Serialize for StakeVoteRegDelegCert {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(5))?;
        self.serialize_as_embedded_group(serializer)
    }
}

impl SerializeEmbeddedGroup for StakeVoteRegDelegCert {
    fn serialize_as_embedded_group<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_unsigned_integer(13u64)?;
        self.stake_credential.serialize(serializer)?;
        self.pool_keyhash.serialize(serializer)?;
        self.drep.serialize(serializer)?;
        self.coin.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for StakeVoteRegDelegCert {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let ret = Self::deserialize_as_embedded_group(raw, len);
            match len {
                cbor_event::Len::Len(_) =>
                /* TODO: check finite len somewhere */
                {
                    ()
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("StakeVoteRegDelegCert"))
    }
}

impl DeserializeEmbeddedGroup for StakeVoteRegDelegCert {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let index_13_value = raw.unsigned_integer()?;
            if index_13_value != 13 {
                return Err(DeserializeFailure::FixedValueMismatch {
                    found: Key::Uint(index_13_value),
                    expected: Key::Uint(13),
                }
                .into());
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("index_13"))?;
        let stake_credential =
            (|| -> Result<_, DeserializeError> { Ok(StakeCredential::deserialize(raw)?) })()
                .map_err(|e| e.annotate("stake_credential"))?;
        let pool_keyhash =
            (|| -> Result<_, DeserializeError> { Ok(Ed25519KeyHash::deserialize(raw)?) })()
                .map_err(|e| e.annotate("pool_keyhash"))?;
        let drep = (|| -> Result<_, DeserializeError> { Ok(Drep::deserialize(raw)?) })()
            .map_err(|e| e.annotate("drep"))?;
        let coin = (|| -> Result<_, DeserializeError> { Ok(Coin::deserialize(raw)?) })()
            .map_err(|e| e.annotate("coin"))?;
        Ok(StakeVoteRegDelegCert {
            stake_credential,
            pool_keyhash,
            drep,
            coin,
        })
    }
}

// ----

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct RegCommitteeHotKeyCert {
    committee_cold_keyhash: Ed25519KeyHash,
    committee_hot_keyhash: Ed25519KeyHash,
}

to_from_bytes!(RegCommitteeHotKeyCert);

to_from_json!(RegCommitteeHotKeyCert);

#[wasm_bindgen]
impl RegCommitteeHotKeyCert {
    pub fn committee_cold_keyhash(&self) -> Ed25519KeyHash {
        self.committee_cold_keyhash.clone()
    }

    pub fn committee_hot_keyhash(&self) -> Ed25519KeyHash {
        self.committee_hot_keyhash.clone()
    }

    pub fn new(
        committee_cold_keyhash: &Ed25519KeyHash,
        committee_hot_keyhash: &Ed25519KeyHash,
    ) -> Self {
        Self {
            committee_cold_keyhash: committee_cold_keyhash.clone(),
            committee_hot_keyhash: committee_hot_keyhash.clone(),
        }
    }
}

impl cbor_event::se::Serialize for RegCommitteeHotKeyCert {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(3))?;
        self.serialize_as_embedded_group(serializer)
    }
}

impl SerializeEmbeddedGroup for RegCommitteeHotKeyCert {
    fn serialize_as_embedded_group<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_unsigned_integer(14u64)?;
        self.committee_cold_keyhash.serialize(serializer)?;
        self.committee_hot_keyhash.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for RegCommitteeHotKeyCert {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let ret = Self::deserialize_as_embedded_group(raw, len);
            match len {
                cbor_event::Len::Len(_) =>
                /* TODO: check finite len somewhere */
                {
                    ()
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("RegCommitteeHotKeyCert"))
    }
}

impl DeserializeEmbeddedGroup for RegCommitteeHotKeyCert {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let index_14_value = raw.unsigned_integer()?;
            if index_14_value != 14 {
                return Err(DeserializeFailure::FixedValueMismatch {
                    found: Key::Uint(index_14_value),
                    expected: Key::Uint(14),
                }
                .into());
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("index_14"))?;
        let committee_cold_keyhash =
            (|| -> Result<_, DeserializeError> { Ok(Ed25519KeyHash::deserialize(raw)?) })()
                .map_err(|e| e.annotate("committee_cold_keyhash"))?;
        let committee_hot_keyhash =
            (|| -> Result<_, DeserializeError> { Ok(Ed25519KeyHash::deserialize(raw)?) })()
                .map_err(|e| e.annotate("committee_hot_keyhash"))?;
        Ok(RegCommitteeHotKeyCert {
            committee_cold_keyhash,
            committee_hot_keyhash,
        })
    }
}

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct UnregCommitteeHotKeyCert {
    committee_cold_keyhash: Ed25519KeyHash,
}

to_from_bytes!(UnregCommitteeHotKeyCert);

to_from_json!(UnregCommitteeHotKeyCert);

#[wasm_bindgen]
impl UnregCommitteeHotKeyCert {
    pub fn committee_cold_keyhash(&self) -> Ed25519KeyHash {
        self.committee_cold_keyhash.clone()
    }

    pub fn new(committee_cold_keyhash: &Ed25519KeyHash) -> Self {
        Self {
            committee_cold_keyhash: committee_cold_keyhash.clone(),
        }
    }
}

impl cbor_event::se::Serialize for UnregCommitteeHotKeyCert {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(2))?;
        self.serialize_as_embedded_group(serializer)
    }
}

impl SerializeEmbeddedGroup for UnregCommitteeHotKeyCert {
    fn serialize_as_embedded_group<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_unsigned_integer(15u64)?;
        self.committee_cold_keyhash.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for UnregCommitteeHotKeyCert {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let ret = Self::deserialize_as_embedded_group(raw, len);
            match len {
                cbor_event::Len::Len(_) =>
                /* TODO: check finite len somewhere */
                {
                    ()
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("UnregCommitteeHotKeyCert"))
    }
}

impl DeserializeEmbeddedGroup for UnregCommitteeHotKeyCert {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let index_15_value = raw.unsigned_integer()?;
            if index_15_value != 15 {
                return Err(DeserializeFailure::FixedValueMismatch {
                    found: Key::Uint(index_15_value),
                    expected: Key::Uint(15),
                }
                .into());
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("index_15"))?;
        let committee_cold_keyhash =
            (|| -> Result<_, DeserializeError> { Ok(Ed25519KeyHash::deserialize(raw)?) })()
                .map_err(|e| e.annotate("committee_cold_keyhash"))?;
        Ok(UnregCommitteeHotKeyCert {
            committee_cold_keyhash,
        })
    }
}

// ----

pub type VotingCredential = StakeCredential;

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct RegDrepCert {
    voting_credential: VotingCredential,
    coin: Coin,
}

to_from_bytes!(RegDrepCert);

to_from_json!(RegDrepCert);

#[wasm_bindgen]
impl RegDrepCert {
    pub fn voting_credential(&self) -> VotingCredential {
        self.voting_credential.clone()
    }

    pub fn coin(&self) -> Coin {
        self.coin.clone()
    }

    pub fn new(voting_credential: &VotingCredential, coin: &Coin) -> Self {
        Self {
            voting_credential: voting_credential.clone(),
            coin: coin.clone(),
        }
    }
}

impl cbor_event::se::Serialize for RegDrepCert {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(3))?;
        self.serialize_as_embedded_group(serializer)
    }
}

impl SerializeEmbeddedGroup for RegDrepCert {
    fn serialize_as_embedded_group<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_unsigned_integer(16u64)?;
        self.voting_credential.serialize(serializer)?;
        self.coin.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for RegDrepCert {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let ret = Self::deserialize_as_embedded_group(raw, len);
            match len {
                cbor_event::Len::Len(_) =>
                /* TODO: check finite len somewhere */
                {
                    ()
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("RegDrepCert"))
    }
}

impl DeserializeEmbeddedGroup for RegDrepCert {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let index_16_value = raw.unsigned_integer()?;
            if index_16_value != 16 {
                return Err(DeserializeFailure::FixedValueMismatch {
                    found: Key::Uint(index_16_value),
                    expected: Key::Uint(16),
                }
                .into());
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("index_16"))?;
        let voting_credential =
            (|| -> Result<_, DeserializeError> { Ok(VotingCredential::deserialize(raw)?) })()
                .map_err(|e| e.annotate("voting_credential"))?;
        let coin = (|| -> Result<_, DeserializeError> { Ok(Coin::deserialize(raw)?) })()
            .map_err(|e| e.annotate("coin"))?;
        Ok(RegDrepCert {
            voting_credential,
            coin,
        })
    }
}

// ----

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct UnregDrepCert {
    voting_credential: VotingCredential,
    coin: Coin,
}

to_from_bytes!(UnregDrepCert);

to_from_json!(UnregDrepCert);

#[wasm_bindgen]
impl UnregDrepCert {
    pub fn voting_credential(&self) -> VotingCredential {
        self.voting_credential.clone()
    }

    pub fn coin(&self) -> Coin {
        self.coin.clone()
    }

    pub fn new(voting_credential: &VotingCredential, coin: &Coin) -> Self {
        Self {
            voting_credential: voting_credential.clone(),
            coin: coin.clone(),
        }
    }
}

impl cbor_event::se::Serialize for UnregDrepCert {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(3))?;
        self.serialize_as_embedded_group(serializer)
    }
}

impl SerializeEmbeddedGroup for UnregDrepCert {
    fn serialize_as_embedded_group<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_unsigned_integer(17u64)?;
        self.voting_credential.serialize(serializer)?;
        self.coin.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for UnregDrepCert {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let ret = Self::deserialize_as_embedded_group(raw, len);
            match len {
                cbor_event::Len::Len(_) =>
                /* TODO: check finite len somewhere */
                {
                    ()
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("UnregDrepCert"))
    }
}

impl DeserializeEmbeddedGroup for UnregDrepCert {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let index_17_value = raw.unsigned_integer()?;
            if index_17_value != 17 {
                return Err(DeserializeFailure::FixedValueMismatch {
                    found: Key::Uint(index_17_value),
                    expected: Key::Uint(17),
                }
                .into());
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("index_17"))?;
        let voting_credential =
            (|| -> Result<_, DeserializeError> { Ok(VotingCredential::deserialize(raw)?) })()
                .map_err(|e| e.annotate("voting_credential"))?;
        let coin = (|| -> Result<_, DeserializeError> { Ok(Coin::deserialize(raw)?) })()
            .map_err(|e| e.annotate("coin"))?;
        Ok(UnregDrepCert {
            voting_credential,
            coin,
        })
    }
}

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct PoolVotingThresholds {
    motion_no_confidence: UnitInterval,
    committee_normal: UnitInterval,
    committee_no_confidence: UnitInterval,
    hard_fork_initiation: UnitInterval,
}

to_from_bytes!(PoolVotingThresholds);

to_from_json!(PoolVotingThresholds);

#[wasm_bindgen]
impl PoolVotingThresholds {
    pub fn motion_no_confidence(&self) -> UnitInterval {
        self.motion_no_confidence.clone()
    }

    pub fn committee_normal(&self) -> UnitInterval {
        self.committee_normal.clone()
    }

    pub fn committee_no_confidence(&self) -> UnitInterval {
        self.committee_no_confidence.clone()
    }

    pub fn hard_fork_initiation(&self) -> UnitInterval {
        self.hard_fork_initiation.clone()
    }

    pub fn new(
        motion_no_confidence: &UnitInterval,
        committee_normal: &UnitInterval,
        committee_no_confidence: &UnitInterval,
        hard_fork_initiation: &UnitInterval,
    ) -> Self {
        Self {
            motion_no_confidence: motion_no_confidence.clone(),
            committee_normal: committee_normal.clone(),
            committee_no_confidence: committee_no_confidence.clone(),
            hard_fork_initiation: hard_fork_initiation.clone(),
        }
    }
}

impl cbor_event::se::Serialize for PoolVotingThresholds {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(4))?;
        self.motion_no_confidence.serialize(serializer)?;
        self.committee_normal.serialize(serializer)?;
        self.committee_no_confidence.serialize(serializer)?;
        self.hard_fork_initiation.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for PoolVotingThresholds {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            if let cbor_event::Len::Len(n) = len {
                if n != 4 {
                    return Err(DeserializeFailure::CBOR(cbor_event::Error::WrongLen(
                        4,
                        len,
                        "[unit_interval, unit_interval, unit_interval, unit_interval]",
                    ))
                    .into());
                }
            }
            let motion_no_confidence = UnitInterval::deserialize(raw)?;
            let committee_normal = UnitInterval::deserialize(raw)?;
            let committee_no_confidence = UnitInterval::deserialize(raw)?;
            let hard_fork_initiation = UnitInterval::deserialize(raw)?;

            if let cbor_event::Len::Indefinite = len {
                if raw.special()? != CBORSpecial::Break {
                    return Err(DeserializeFailure::EndingBreakMissing.into());
                }
            }
            Ok(PoolVotingThresholds {
                motion_no_confidence,
                committee_normal,
                committee_no_confidence,
                hard_fork_initiation,
            })
        })()
        .map_err(|e| e.annotate("PoolVotingThresholds"))
    }
}

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct DrepVotingThresholds {
    motion_no_confidence: UnitInterval,
    committee_normal: UnitInterval,
    committee_no_confidence: UnitInterval,
    update_constitution: UnitInterval,
    hard_fork_initiation: UnitInterval,
    pp_network_group: UnitInterval,
    pp_economic_group: UnitInterval,
    pp_technical_group: UnitInterval,
    pp_governance_group: UnitInterval,
    treasury_withdrawal: UnitInterval,
}

to_from_bytes!(DrepVotingThresholds);

to_from_json!(DrepVotingThresholds);

#[wasm_bindgen]
impl DrepVotingThresholds {
    pub fn motion_no_confidence(&self) -> UnitInterval {
        self.motion_no_confidence.clone()
    }

    pub fn committee_normal(&self) -> UnitInterval {
        self.committee_normal.clone()
    }

    pub fn committee_no_confidence(&self) -> UnitInterval {
        self.committee_no_confidence.clone()
    }

    pub fn update_constitution(&self) -> UnitInterval {
        self.update_constitution.clone()
    }

    pub fn hard_fork_initiation(&self) -> UnitInterval {
        self.hard_fork_initiation.clone()
    }

    pub fn pp_network_group(&self) -> UnitInterval {
        self.pp_network_group.clone()
    }

    pub fn pp_economic_group(&self) -> UnitInterval {
        self.pp_economic_group.clone()
    }

    pub fn pp_technical_group(&self) -> UnitInterval {
        self.pp_technical_group.clone()
    }

    pub fn pp_governance_group(&self) -> UnitInterval {
        self.pp_governance_group.clone()
    }

    pub fn treasury_withdrawal(&self) -> UnitInterval {
        self.treasury_withdrawal.clone()
    }

    pub fn new(
        motion_no_confidence: &UnitInterval,
        committee_normal: &UnitInterval,
        committee_no_confidence: &UnitInterval,
        update_constitution: &UnitInterval,
        hard_fork_initiation: &UnitInterval,
        pp_network_group: &UnitInterval,
        pp_economic_group: &UnitInterval,
        pp_technical_group: &UnitInterval,
        pp_governance_group: &UnitInterval,
        treasury_withdrawal: &UnitInterval,
    ) -> Self {
        Self {
            motion_no_confidence: motion_no_confidence.clone(),
            committee_normal: committee_normal.clone(),
            committee_no_confidence: committee_no_confidence.clone(),
            update_constitution: update_constitution.clone(),
            hard_fork_initiation: hard_fork_initiation.clone(),
            pp_network_group: pp_network_group.clone(),
            pp_economic_group: pp_economic_group.clone(),
            pp_technical_group: pp_technical_group.clone(),
            pp_governance_group: pp_governance_group.clone(),
            treasury_withdrawal: treasury_withdrawal.clone(),
        }
    }
}

impl cbor_event::se::Serialize for DrepVotingThresholds {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(10))?;
        self.motion_no_confidence.serialize(serializer)?;
        self.committee_normal.serialize(serializer)?;
        self.committee_no_confidence.serialize(serializer)?;
        self.update_constitution.serialize(serializer)?;
        self.hard_fork_initiation.serialize(serializer)?;
        self.pp_network_group.serialize(serializer)?;
        self.pp_economic_group.serialize(serializer)?;
        self.pp_technical_group.serialize(serializer)?;
        self.pp_governance_group.serialize(serializer)?;
        self.treasury_withdrawal.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for DrepVotingThresholds {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            if let cbor_event::Len::Len(n) = len {
                if n != 10 {
                    return Err(DeserializeFailure::CBOR(cbor_event::Error::WrongLen(
                        10,
                        len,
                        "[unit_interval, unit_interval, unit_interval, unit_interval, unit_interval, unit_interval, unit_interval, unit_interval, unit_interval, unit_interval]",
                    ))
                    .into());
                }
            }
            let motion_no_confidence = UnitInterval::deserialize(raw)?;
            let committee_normal = UnitInterval::deserialize(raw)?;
            let committee_no_confidence = UnitInterval::deserialize(raw)?;
            let update_constitution = UnitInterval::deserialize(raw)?;
            let hard_fork_initiation = UnitInterval::deserialize(raw)?;
            let pp_network_group = UnitInterval::deserialize(raw)?;
            let pp_economic_group = UnitInterval::deserialize(raw)?;
            let pp_technical_group = UnitInterval::deserialize(raw)?;
            let pp_governance_group = UnitInterval::deserialize(raw)?;
            let treasury_withdrawal = UnitInterval::deserialize(raw)?;

            if let cbor_event::Len::Indefinite = len {
                if raw.special()? != CBORSpecial::Break {
                    return Err(DeserializeFailure::EndingBreakMissing.into());
                }
            }
            Ok(DrepVotingThresholds {
                motion_no_confidence,
                committee_normal,
                committee_no_confidence,
                update_constitution,
                hard_fork_initiation,
                pp_network_group,
                pp_economic_group,
                pp_technical_group,
                pp_governance_group,
                treasury_withdrawal,
            })
        })()
        .map_err(|e| e.annotate("DrepVotingThresholds"))
    }
}
