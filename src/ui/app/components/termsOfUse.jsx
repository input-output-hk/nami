import { Box } from '@chakra-ui/layout';
import React from 'react';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalCloseButton,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/modal';
import { useDisclosure } from '@chakra-ui/react';
import Scrollbars from 'react-custom-scrollbars';

const TermsOfUse = React.forwardRef((props, ref) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  React.useImperativeHandle(ref, () => ({
    openModal() {
      onOpen();
    },
    closeModal() {
      onClose();
    },
  }));
  return (
    <Modal size="xs" isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader fontSize="md">Terms of use</ModalHeader>

        <ModalBody pr="0.5">
          <Scrollbars style={{ width: '100%', height: '400px' }}>
            <Box width="92%">
              <p>
                Terms of Service Agreement THIS TERMS OF SERVICE AGREEMENT
                (&quot;Agreement&quot;) is made between EMURGO Co., Ltd.
                (&quot;Company&quot;) and any person or entity
                (&quot;User&quot;) who completes the process to download,
                utilize, or operate the software known as the Yoroi
                cryptocurrency Wallet application, and data processing service,
                application, communication service or other content or offered
                or provided with the software by the Company
                (&quot;Software&quot;). The Company and User are collectively
                referred to as the &quot;Parties.&quot; BY CLICKING THE
                ACCEPTANCE BUTTON OR ACCESSING, USING OR INSTALLING ANY PART OF
                THE SOFTWARE, USER EXPRESSLY AGREES TO AND CONSENTS TO BE
                LEGALLY BOUND BY ALL OF THE TERMS OF THIS AGREEMENT. IF USER
                DOES NOT AGREE TO ALL OF THE TERMS OF THIS AGREEMENT, THE USER
                SHALL NOT BE AUTHORIZED TO ACCESS, USE OR INSTALL ANY PART OF
                THE SOFTWARE.
              </p>

              <p>
                1. Rights and Obligations a. Description. The Software functions
                as a free, open source, digital cryptocurrency wallet. The
                Software does not constitute an account by which the Company or
                any other third parties serve as financial intermediaries or
                custodians of User's ADA or any other cryptocurrency. While the
                Software has undergone beta testing and continues to be improved
                by feedback from the developers community, open-source
                contributors and beta-testers, the Company cannot guarantee that
                there will be no bugs in the Software. User acknowledges that
                User's use of the Software is at User's risk, discretion and in
                compliance with all applicable laws. User is responsible for
                safekeeping User's passwords, PINs, private keys, redemption
                keys, shielded vending keys, backup recovery mnemonic
                passphrases, ADA passcodes and any other codes User uses to
                access the Software or any information, ADA, voucher, or other
                cryptocurrency unit. IF USER LOSES ACCESS TO USER'S
                CRYPTOCURRENCY WALLET OR PRIVATE KEYS AND HAS NOT SEPARATELY
                STORED A BACKUP OF USER'S CRYPTOCURRENCY WALLET OR BACKUP
                RECOVERY MNEMONIC PHRASE(S) AND CORRESPONDING PASSWORD(S), USER
                ACKNOWLEDGES AND AGREES THAT ANY ADA OR ANY OTHER
                CRYPTOCURRENCIES USER HAS ASSOCIATED WITH THAT CRYPTOCURRENCY
                WALLET WILL BECOME INACCESSIBLE. All transaction requests are
                irreversible. The Company and its shareholders, directors,
                officers, employees, affiliates and agents cannot guarantee
                transaction confirmation or retrieve User's private keys or
                passwords if User loses or forgets them.
              </p>

              <p>
                b. Accessibility. User agrees that from time to time the
                Software may be inaccessible or inoperable for any reason,
                including, without limitation: (i) equipment malfunctions; (ii)
                periodic maintenance procedures or repairs which the Company may
                undertake from time to time; or (iii) causes beyond the control
                of the Company or which are not reasonably foreseeable by the
                Company.
              </p>

              <p>
                c. Equipment. User shall be solely responsible for providing,
                maintaining and ensuring compatibility with the Software, all
                hardware, software, electrical and other physical requirements
                for User's use of the Software, including, without limitation,
                telecommunications and internet access connections and links,
                web browsers or other equipment, programs and services required
                to access and use the Software.
              </p>

              <p>
                d. Security. User shall be solely responsible for the security,
                confidentiality and integrity of all information and content
                that User receives, transmits through or stores on the Software.
                User shall be solely responsible for any authorized or
                unauthorized access to any account of User by any person. User
                agrees to bear all responsibility for the confidentiality of
                User's security devices, information, keys, and passwords.
              </p>

              <p>
                e. Privacy. When reasonably practicable, the Company will
                attempt to respect User's privacy. The Company will not monitor,
                edit, or disclose any personal information about User or User's
                account, including its contents or User's use of the Software,
                without User's prior consent unless the Company believes in good
                faith that such action is necessary to: (i) comply with legal
                process or other legal requirements of any governmental
                authority; (ii) protect and defend the rights or property of the
                Company; (iii) enforce this Agreement; (iv) protect the
                interests of users of the Software other than User or any other
                person; or (v) operate or conduct maintenance and repair of the
                Company's services or equipment, including the Software as
                authorized by law. User has no expectation of privacy with
                respect to the Internet generally. User's IP address is
                transmitted and recorded with each message or other information
                User sends from the Software.
              </p>

              <p>
                2. Taxes and Fees All currency conversion charges, third party
                fees, sales, use, value-added, personal property or other tax,
                duty or levy of any kind, including interest and penalties
                thereon, whether imposed now or hereinafter by any governmental
                entity, and fees incurred by User by reason of User's access,
                use or installation of the Software shall be the sole
                responsibility of User.
              </p>

              <p>
                3. User Representations User represents and warrants to the
                Company that: (a) if User is a natural person, User is over the
                age of eighteen (18); (b) User has the power and authority to
                enter into and perform User's obligations under this Agreement;
                (c) all information provided by User to the Company is truthful,
                accurate and complete; (d) User will comply with all laws and
                regulations of any applicable jurisdiction with regard to User's
                access, use or installation of the Software; (e) User shall
                comply with all terms and conditions of this Agreement,
                including, without limitation, the provisions set forth at
                Section 4; and (f) User has provided and will provide accurate
                and complete information as required for access, use or
                installation of the Software.
              </p>

              <p>
                4. Prohibited Uses User is solely responsible for any and all
                acts and omissions that occur under User's account, security
                information, keys or password, and User agrees not to engage in
                unacceptable use of the Software, which includes, without
                limitation, use of the Software to: (a) disseminate, store or
                transmit unsolicited messages, chain letters or unsolicited
                commercial email; (b) disseminate or transmit material that, to
                a reasonable person may be abusive, obscene, pornographic,
                defamatory, harassing, grossly offensive, vulgar, threatening or
                malicious; (c) disseminate, store or transmit files, graphics,
                software or other material that actually or potentially
                infringes the copyright, trademark, patent, trade secret or
                other intellectual property right of any person; (d) create a
                false identity or to otherwise attempt to mislead any person as
                to the identity or origin of any communication; (e) export,
                re-export or permit downloading of any message or content in
                violation of any export or import law, regulation or restriction
                of any applicable jurisdiction, or without all required
                approvals, licenses or exemptions; (f) interfere, disrupt or
                attempt to gain unauthorized access to other accounts on the
                Software or any other computer network; or (g) disseminate,
                store or transmit viruses, Trojan horses or any other malicious
                code or program.
              </p>

              <p>
                5. Termination This Agreement is effective upon User's
                acceptance as set forth herein and shall continue in full force
                so long as User engages in any access, use or installation of
                the Software. The Company reserves the right, in its sole
                discretion and without notice, at any time and for any reason,
                to: (a) remove or disable access to all or any portion of the
                Software; (b) suspend User's access to or use of all or any
                portion of the Software; and (c) terminate this Agreement.
              </p>

              <p>
                6. Disclaimer of Warranties THE SOFTWARE IS PROVIDED &quot;AS
                IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. USE
                OF THE SOFTWARE IS AT USER'S SOLE RISK. THE COMPANY DOES NOT
                WARRANT THAT THE SOFTWARE WILL BE UNINTERRUPTED OR ERROR FREE,
                NOR DOES THE COMPANY MAKE ANY WARRANTY AS TO ANY RESULTS THAT
                MAY BE OBTAINED BY USE OF THE SOFTWARE. THE COMPANY MAKES NO
                OTHER WARRANTIES, EXPRESS OR IMPLIED. THE COMPANY EXPRESSLY
                DISCLAIMS ANY WARRANTY OF MERCHANTABILITY, WARRANTY OF
                SUITABILITY FOR A PARTICULAR PURPOSE, WARRANTY OF TITLE OR
                INTEREST, OR WARRANTY OF NONINFRINGEMENT.
              </p>

              <p>
                7. Limitation of Liability IN NO EVENT SHALL THE COMPANY OR ITS
                SHAREHOLDERS, DIRECTORS, OFFICERS, EMPLOYEES, AFFILIATES OR
                AGENTS, OR ANY OF ITS OR THEIR RESPECTIVE SERVICE PROVIDERS, BE
                LIABLE TO USER OR ANY THIRD PARTY FOR ANY USE, INTERRUPTION,
                DELAY OR INABILITY TO USE THE SOFTWARE, LOST REVENUES OR
                PROFITS, DELAYS, INTERRUPTION OR LOSS OF SERVICES, BUSINESS OR
                GOODWILL, LOSS OR CORRUPTION OF DATA, LOSS RESULTING FROM SYSTEM
                OR SYSTEM SERVICE FAILURE, MALFUNCTION OR SHUTDOWN, FAILURE TO
                ACCURATELY TRANSFER, READ OR TRANSMIT INFORMATION, FAILURE TO
                UPDATE OR PROVIDE CORRECT INFORMATION, SYSTEM INCOMPATIBILITY OR
                PROVISION OF INCORRECT COMPATIBILITY INFORMATION OR BREACHES IN
                SYSTEM SECURITY, OR FOR ANY CONSEQUENTIAL, INCIDENTAL, INDIRECT,
                EXEMPLARY, SPECIAL OR PUNITIVE DAMAGES, WHETHER ARISING OUT OF
                OR IN CONNECTION WITH THIS AGREEMENT, BREACH OF CONTRACT, TORT
                (INCLUDING NEGLIGENCE) OR OTHERWISE, REGARDLESS OF WHETHER SUCH
                DAMAGES WERE FORESEEABLE AND WHETHER OR NOT WE WERE ADVISED OF
                THE POSSIBILITY OF SUCH DAMAGES. IN NO EVENT SHALL THE COMPANY
                OR ITS SHAREHOLDERS, DIRECTORS, OFFICERS, EMPLOYEES, AFFILIATES
                OR AGENTS, OR ANY OF ITS OR THEIR RESPECTIVE SERVICE PROVIDERS,
                BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN
                AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM OR IN ANY
                WAY RELATED TO USER'S ACCESS, USE OR INSTALLATION OF THE
                SOFTWARE. SOME JURISDICTIONS PROHIBIT THE EXCLUSION OR
                LIMITATION OF INCIDENTAL OR CONSEQUENTIAL DAMAGES, THUS THIS
                LIMITATION OF LIABILITY MAY NOT APPLY TO USER. IF USER IS
                DISSATISFIED WITH THE SOFTWARE, USER'S SOLE AND EXCLUSIVE REMEDY
                SHALL BE FOR USER TO DISCONTINUE USE OF THE SOFTWARE.
              </p>

              <p>
                8. Indemnification User agrees to indemnify, hold harmless and
                defend the Company, its shareholders, directors, officers,
                employees, affiliates and agents (&quot;Indemnified
                Parties&quot;) from and against any action, cause, claim,
                damage, debt, demand or liability, including reasonable costs
                and attorney's fees, asserted by any person, arising out of or
                relating to: (a) this Agreement; (b) User's access, use or
                installation of the Software, including any data or work
                transmitted or received by User; and (c) any unacceptable use of
                the Software by any person, including, without limitation, any
                statement, data or content made, transmitted or republished by
                User or any person which is prohibited as unacceptable under
                Section 4. THIS INDEMNIFICATION INCLUDES THE EXPRESS
                INDEMNIFICATION OF THE COMPANY AND ALL INDEMNIFIED PARTIES FOR
                ANY ALLEGED NEGLIGENCE (INCLUDING ANY ALLEGED GROSS NEGLIGENCE).
                OR OTHER ALLEGED MISCONDUCT OF THE COMPANY OR ANY INDEMNIFIED
                PARTIES.
              </p>

              <p>
                9. Intellectual Property The Company retains all right, title,
                and interest in and to all of the Company's brands, logos, and
                trademarks, including, but not limited to, EMURGO Co., Ltd.,
                EMURGO, Yoroi, Yoroi Cryptocurrency Wallet, Yoroi Wallet, Yoroi
                App, and variations of the wording of the aforementioned brands,
                logos, and trademarks.
              </p>

              <p>
                10. Warnings User acknowledges that the Company shall not be
                responsible for transferring, safeguarding, or maintaining
                private keys and/or User's ADA or any other cryptocurrency. If
                User and/or any co-signing authorities lose, mishandle, or have
                stolen associated private keys, or if User's cosigners refuse to
                provide requisite authority, User acknowledges that User may not
                be able to recover User's ADA or any other cryptocurrency, and
                that the Company shall not be responsible for such loss.
              </p>

              <p>
                User acknowledges and agrees that ADA or any other
                cryptocurrency transactions facilitated by the Software and/or
                the Company may be delayed, and that the Company shall not be
                responsible for any associated loss. User acknowledges and
                agrees that the Company shall not be responsible for any aspect
                of the information, content, or services contained in any
                third-party materials or on any third party sites accessible or
                linked to the Software and/or the Company.
              </p>

              <p>
                By using the Software, User acknowledges and agrees: (i) that
                the Company is not responsible for the operation of the
                underlying protocols and that the Company makes no guarantee of
                their functionality, security, or availability; and (ii) that
                the underlying protocols are subject to sudden main-chain
                changes in operating rules (&quot;forks&quot;), and that such
                forks may materially affect the value, and/or function of the
                ADA or any other cryptocurrency that User stores on the
                Software. In the event of a fork, User agrees that the Company
                may temporarily suspend the Software operations (with or without
                notice to User) and that the Company may, in its sole
                discretion, (a) configure or reconfigure its systems or (b)
                decide not to support (or cease supporting) the forked protocol
                entirely, provided, however, that User will have an opportunity
                to withdraw funds from the Software. User acknowledges and
                agrees that the Company assumes absolutely no responsibility
                whatsoever in respect of an unsupported branch of a forked
                protocol.
              </p>

              <p>
                11. Miscellaneous a. Amendment. The Company shall have the
                right, at any time and without notice, to add to or modify the
                terms of this Agreement, simply by delivering such amended terms
                to User by electronic message through any medium to any address
                provided to the Company by User. User's access to or use of the
                Software after the date such amended terms are delivered to User
                shall be deemed to constitute acceptance of such amended terms.
              </p>

              <p>
                b. Severance. If any provision or part-provision of this
                Agreement is, or becomes invalid, illegal or unenforceable, it
                shall be deemed modified to the minimum extent necessary to make
                it valid, legal and enforceable. If such modification is not
                possible, the relevant provision or part-provision shall be
                deemed deleted. Any modification to or deletion of a provision
                or part-provision under this Article shall not affect the
                validity and enforceability of the rest of this Agreement.
              </p>

              <p>
                c. Entire Agreement &ndash; Disclaimer of Reliance. This
                Agreement constitutes the entire agreement between the Parties
                with respect to the subject matter hereof and supersedes all
                prior agreements or understandings between the Parties. User
                expressly represents and warrants that it is not relying upon
                any statements, understandings, representations, expectations or
                agreements other than those expressly set forth in this
                Agreement.
              </p>

              <p>
                d. THIS AGREEMENT IS SUBJECT TO BINDING ARBITRATION. User agrees
                that any and all disputes or claims against any person arising
                out of or in any way related to this Agreement or the access,
                use or installation of the Software by User or any other person
                shall be subject to binding arbitration under the Rules of
                Arbitration of the International Chamber of Commerce by one or
                more arbitrators appointed in accordance with the said Rules.
                The location of the arbitration shall be Japan. The language of
                the arbitration shall be English.
              </p>

              <p>
                e. LANGUAGE. Any translation of this Agreement is made for
                purposes of local reference only and in the event of any
                inconsistency between the English and any non-English versions,
                the English version of this Agreement shall prevail and govern
                in all respects.
              </p>

              <p>
                12. Delegation and Staking 12.1 Rewards. The amount of Rewards a
                User may earn from delegation depends on various factors
                including, but not limited to, user participation, stakepool
                profit margins and the volume of ada being delegated. It is
                possible that delegation generates no Reward for a User due to
                the above-mentioned factors. Rewards are earned as of the start
                of the 3rd epoch on the Cardano blockchain.
              </p>

              <p>
                12.2 Delegation. Users may delegate their stake to one of the
                various stake pools of the Company or to a third party stake
                pool. User will have the sole right to determine the volume to
                be delegated to a stake pool and may increase or decrease its
                level of participation at any time. Any information Company
                shares regarding stakepools, including performance metrics and
                Rewards, will be for indicative purposes only and may not be
                accurate. Users may only delegate their stake to a stake pool if
                their ada is in an updated Daedalus or an updated Yoroi wallet
                at the time of the setup process. User does not acquire any
                automatic right to Rewards as a result of delegating its stake.
              </p>

              <p>
                12.3 Company Stake-Pools. The Company will operate various stake
                pools which will be visible in Yoroi. The cost and network and
                server requirements to reliably operate such stake pools shall
                be determined by the Company in its sole discretion. Company
                will communicate the percentage amount of Reward to be shared
                with Users through the User&rsquo;s Yoroi wallet. Rewards will
                accrue at the end of each epoch and will automatically appear in
                the User&rsquo;s Yoroi wallet.
              </p>

              <p>
                12.4 Redeeming Rewards. User shall be responsible for payment of
                all applicable taxes, if any, to which the Rewards might be
                subject and any and all other taxes which may apply to User once
                Rewards are redeemed.
              </p>
              <Box h="2" />
            </Box>
          </Scrollbars>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
});

export default TermsOfUse;
